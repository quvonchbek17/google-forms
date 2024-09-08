import { Request, Response, NextFunction } from "express";
import { forms_v1 } from "googleapis";
import { ErrorHandler } from "@errors";
import { formsBuilder } from "@config";

export class FormItemsController {

  // Formdagi barcha itemlarni olish
  static async GetItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const form = await formsBuilder(token);
      const { formId } = req.query;

      const result = await form.forms.get({
        formId: formId as string,
      });

      res.status(200).send({
        success: true,
        message: "Form savollari muvaffaqiyatli olindi",
        data: result.data?.items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // Formda yangi itemlarni yaratish
  static async CreateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const form = await formsBuilder(token);

      const { formId, items } = req.body;

      const requests = items.map((item: any, index: number) => ({
        createItem: {
          item: FormItemsController.mapItem(item),
          location: { index }
        }
      }));

      const response = await form.forms.batchUpdate({
        formId: formId,
        requestBody: {
          requests
        },
      });

      res.status(201).send({
        success: true,
        message: "Savollar muvaffaqiyatli yaratildi",
        data: response.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // Itemlarni yangilash
  static async UpdateItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const form = await formsBuilder(token);

      const { formId, items } = req.body;

      const requests = items.map((item: any) => ({
        updateItem: {
          location: { index: item.location }, 
          item: FormItemsController.mapItem(item.updatedItem),
          updateMask: 'title,description,questionItem.question'
        }
      }));

      const response = await form.forms.batchUpdate({
        formId: formId,
        requestBody: { requests }
      });

      res.status(200).send({
        success: true,
        message: 'Itemlar muvaffaqiyatli yangilandi',
        data: response.data
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // Itemni o'chirish
  static async DeleteItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.access_token as string;
      const form = await formsBuilder(token);

      const { formId, location } = req.body;

      const result = await form.forms.batchUpdate({
        formId: formId,
        requestBody: {
          requests: [
            {
               deleteItem: {
                 location: { index: location }
               }
            }
          ]
        }
      });

      res.status(200).send({
        success: true,
        message: "Savol muvaffaqiyatli o'chirildi",
        data: result.data,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static mapItem(item: any) {
    const baseQuestion = {
      title: item.title,
      description: item.description,
      questionItem: {
        question: {
          required: item.required || false
        }
      }
    };

    if (item.textItem) {
      return {
        ...baseQuestion,
        questionItem: {
          ...baseQuestion.questionItem,
          question: {
            ...baseQuestion.questionItem.question,
            textQuestion: {
              paragraph: item.textItem.paragraph || false
            }
          }
        }
      };
    } else if (item.choiceQuestion) {
      return {
        ...baseQuestion,
        questionItem: {
          ...baseQuestion.questionItem,
          question: {
            ...baseQuestion.questionItem.question,
            choiceQuestion: {
              type: item.choiceQuestion.type, // "RADIO", "CHECKBOX", yoki "DROPDOWN"
              options: item.choiceQuestion.options.map((option: any) => ({ value: option.value }))
            }
          }
        }
      };
    } else if (item.scaleQuestion) {
      return {
        ...baseQuestion,
        questionItem: {
          ...baseQuestion.questionItem,
          question: {
            ...baseQuestion.questionItem.question,
            scaleQuestion: {
              low: item.scaleQuestion.low,
              high: item.scaleQuestion.high,
              lowLabel: item.scaleQuestion.lowLabel,
              highLabel: item.scaleQuestion.highLabel
            }
          }
        }
      };
    } else if (item.dateQuestion) {
      return {
        ...baseQuestion,
        questionItem: {
          ...baseQuestion.questionItem,
          question: {
            ...baseQuestion.questionItem.question,
            dateQuestion: {
              includeYear: item.dateQuestion.includeYear || true,
              includeTime: item.dateQuestion.includeTime || false
            }
          }
        }
      };
    } else if (item.timeQuestion) {
      return {
        ...baseQuestion,
        questionItem: {
          ...baseQuestion.questionItem,
          question: {
            ...baseQuestion.questionItem.question,
            timeQuestion: {
              duration: item.timeQuestion.duration || false
            }
          }
        }
      };
    } else if (item.video) {
      return {
        title: item.title,
        description: item.description,
        videoItem: {
          video: {
            youtubeUri: item.video?.youtubeUri,
            properties: {
              width: item.video?.width
            }
          },
          caption: item.video?.caption
        }
      };
    } else if (item.image) {
      return {
        title: item.title,
        description: item.description,
        imageItem: {
          image: {
            contentUri: item.image?.contentUri,
            altText: item.image?.altText,
            properties: {
              width: item.image?.width
            },
            sourceUri: item.image?.sourceUri
          }
        }
      };
    }

    return {};
  }
}
