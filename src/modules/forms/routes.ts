import { Router } from "express";
import { FormsController } from "./forms";
import {  createFormDto, deleteFormDto, getFormByIdDto, getFormResponsesDto, getSingleFormResponseDto, importQuestionsFromDriveDto, updateFormDto, validate } from "@middlewares";
import { upload } from "@config";

let FormsRouter = Router()

FormsRouter
    .get("/all", FormsController.GetAllForms)
    .get("/get-by-id", validate(getFormByIdDto, "query"), FormsController.GetFormById)
    .get("/get-form-responses", validate(getFormResponsesDto, "query"), FormsController.GetFormResponses)
    .get("/get-single-form-response", validate(getSingleFormResponseDto, "query"), FormsController.GetSingleFormResponse)
    .post("/create", validate(createFormDto), FormsController.CreateForm)
    .post("/import-questions-from-file", upload.single("file"), FormsController.ImportQuestionsFromFile)
    .post("/import-questions-from-drive", validate(importQuestionsFromDriveDto), FormsController.ImportQuestionsFromDrive)
    .patch("/update", validate(updateFormDto), FormsController.UpdateFormInfo)
    .delete("/delete", validate(deleteFormDto), FormsController.DeleteForm)


export {FormsRouter}