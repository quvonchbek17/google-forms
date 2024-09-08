import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@errors";
import { formsBuilder, driveBuilder } from "@config";
import * as fs from "fs"
import path from "path"

export class FormsController {

  static async GetAllForms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const drive = await driveBuilder(token);

      const result = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.form'",
        fields: "*",
      });

      res.status(200).send({
        success: true,
        message: "Barcha formalar muvaffaqiyatli olindi",
        data: result.data.files,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }


  static async GetFormById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const form = await formsBuilder(token);

      const { formId } = req.query;

      const result = await form.forms.get({ formId: String(formId) });

      res.status(200).send({
        success: true,
        message: "Form ma'lumotlari muvaffaqiyatli olindi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async CreateForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const form = await formsBuilder(token);

      const { title } = req.body;

      // Yangi bo'sh forma yaratish
      const result = await form.forms.create({
        requestBody: {
          info: {
            title: title
          }
        }
      });

      res.status(200).send({
        success: true,
        message: "Yangi forma muvaffaqiyatli yaratildi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async UpdateFormInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const form = await formsBuilder(token);

      const { formId, title, documentTitle, description } = req.body;

      // Formani umumiy ma'lumotlarini yangilash
      const updateResult = await form.forms.batchUpdate({
        formId: formId,
        requestBody: {
          requests: [
            {
              updateFormInfo: {
                info: {
                  title: title,
                  documentTitle: documentTitle,
                  description: description,
                },
                updateMask: "title, documentTitle, description",
              },
            },
          ],
        },
      });

      res.status(200).send({
        success: true,
        message: "Form ma'lumotlari muvaffaqiyatli yangilandi",
        data: updateResult.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async DeleteForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const drive = await driveBuilder(token);

      const { formId } = req.body;

      await drive.files.delete({ fileId: formId });

      res.status(200).send({
        success: true,
        message: "Forma muvaffaqiyatli o'chirildi",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetFormResponses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const form = await formsBuilder(token);

      const { formId } = req.query;

      const result = await form.forms.responses.list({ formId: String(formId) });

      res.status(200).send({
        success: true,
        message: "Form javoblari muvaffaqiyatli olindi",
        data: result.data.responses,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async GetSingleFormResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const form = await formsBuilder(token);

      const { formId, responseId } = req.query;

      const result = await form.forms.responses.get({
        formId: String(formId),
        responseId: String(responseId),
      });

      res.status(200).send({
        success: true,
        message: "Form javobi muvaffaqiyatli olindi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async ImportQuestionsFromDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const drive = await driveBuilder(token);
      const form = await formsBuilder(token);

      const { formId, fileId } = req.body;

      // Faylni Google Drive'dan olish
      const driveFile = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'stream' });

      // Faylni o'qish
      let fileData = '';
      driveFile.data.on('data', chunk => fileData += chunk);
      driveFile.data.on('end', async () => {

        const questions = JSON.parse(fileData);

        // Savollarni Google Form'ga qo'shish
        const result = await form.forms.batchUpdate({
          formId: formId,
          requestBody: {
            requests: questions.map((question: any) => ({
              createItem: {
                item: {
                  title: question.title,
                  questionItem: {
                    question: {
                      textQuestion: question.textQuestion || null,
                      choiceQuestion: question.choiceQuestion || null,
                    }
                  }
                },
                location: { index: 0 }
              }
            }))
          }
        });

        res.status(200).send({
          success: true,
          message: "Savollar muvaffaqiyatli import qilindi",
          data: result.data
        });
      });

    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async ImportQuestionsFromFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const form = await formsBuilder(token);

      const { formId } = req.body;
      const file = req.file as Express.Multer.File | undefined;
      let filePath = ""
      if(file){
         filePath = path.join(process.cwd(), "uploads", file.fieldname)
      }

      // Faylni o'qish
      const fileData = fs.readFileSync(filePath, "utf-8");

      // Savollarni JSON formatga aylantirish
      const questions = JSON.parse(fileData);

      // Savollarni Google Form'ga qo'shish
      const result = await form.forms.batchUpdate({
        formId: formId,
        requestBody: {
          requests: questions.map((question: any) => ({
            createItem: {
              item: {
                title: question.title,
                questionItem: {
                  question: {
                    textQuestion: question.textQuestion || null,
                    choiceQuestion: question.choiceQuestion || null,
                    // Savol turi text, choice va boshqalar
                  }
                }
              },
              location: { index: 0 }
            }
          }))
        }
      });

      res.status(200).send({
        success: true,
        message: "Savollar fayldan muvaffaqiyatli import qilindi",
        data: result.data
      });

      fs.unlink(filePath, (err) => {})

    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
