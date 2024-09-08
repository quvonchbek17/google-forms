import Joi from "joi";


export const getFormByIdDto = Joi.object().keys({
    formId: Joi.string().required()
});


export const createFormDto = Joi.object().keys({
    title: Joi.string().required()
});

export const updateFormDto = Joi.object({
  formId: Joi.string().required(),
  title: Joi.string().optional(),
  documentTitle: Joi.string().required(),
  description: Joi.string().optional()
});

export const deleteFormDto = Joi.object({
    formId: Joi.string().required()
});

export const getFormResponsesDto = Joi.object({
    formId: Joi.string().required()
});

export const getSingleFormResponseDto = Joi.object({
    formId: Joi.string().required(),
    responseId: Joi.string().required()
});

export const importQuestionsFromDriveDto = Joi.object({
    formId: Joi.string().required(),
    fileId: Joi.string().required()
});
