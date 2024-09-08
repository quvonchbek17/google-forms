import Joi from "joi";

export const getItemsDto = Joi.object({
  formId: Joi.string().required(),
});

export const ItemSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional().allow(""),
  required: Joi.boolean().optional(),

  // TextItem uchun
  textItem: Joi.object({
    paragraph: Joi.boolean().required(),
  }).optional(),

  image: Joi.object({
    contentUri: Joi.string().optional(),
    altText: Joi.string().optional(),
    width: Joi.number().min(10).optional(),
    sourceUri: Joi.string().optional(),
  }).optional(),

  video: Joi.object({
    youtubeUri: Joi.string().required(),
    width: Joi.number().min(10).optional(),
    caption: Joi.string().optional(),
  }).optional(),

  // ChoiceQuestion uchun
  choiceQuestion: Joi.object({
    type: Joi.string().valid("RADIO", "CHECKBOX", "DROPDOWN").required(),
    options: Joi.array()
      .items(
        Joi.object({
          value: Joi.string().required(),
        })
      )
      .min(1)
      .required(),
  }).optional(),

  // ScaleQuestion uchun
  scaleQuestion: Joi.object({
    low: Joi.number().integer().required(),
    high: Joi.number().integer().required(),
    lowLabel: Joi.string().optional().allow(""),
    highLabel: Joi.string().optional().allow(""),
  }).optional(),

  // DateQuestion uchun
  dateQuestion: Joi.object({
    includeYear: Joi.boolean().required(),
    includeTime: Joi.boolean().required(),
  }).optional(),

  // TimeQuestion uchun
  timeQuestion: Joi.object({
    duration: Joi.boolean().required(),
  }).optional(),
});

export const createItemDto = Joi.object({
  formId: Joi.string().required(),
  items: Joi.array().items(ItemSchema).min(1).required(),
});

export const updateItemDto = Joi.object({
  formId: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().required(), // Item indeksi bo'lishi kerak
        location: Joi.number().integer().min(0).required(),
        updatedItem: Joi.object({
          title: Joi.string().required(),
          description: Joi.string().optional().allow(""),

          textItem: Joi.object({
            paragraph: Joi.boolean().required(),
          }).optional(),

          choiceQuestion: Joi.object({
            type: Joi.string()
              .valid("RADIO", "CHECKBOX", "DROPDOWN")
              .required(),
            options: Joi.array()
              .items(
                Joi.object({
                  value: Joi.string().required(),
                })
              )
              .min(1)
              .required(),
          }).optional(),

          scaleQuestion: Joi.object({
            low: Joi.number().integer().required(),
            high: Joi.number().integer().required(),
            lowLabel: Joi.string().optional().allow(""),
            highLabel: Joi.string().optional().allow(""),
          }).optional(),

          dateQuestion: Joi.object({
            includeYear: Joi.boolean().required(),
            includeTime: Joi.boolean().required(),
          }).optional(),

          timeQuestion: Joi.object({
            duration: Joi.boolean().required(),
          }).optional(),
        }).required(),
      })
    )
    .min(1)
    .required(),
});

export const deleteItemDto = Joi.object({
  formId: Joi.string().required(),
  location: Joi.number().integer().min(0).required(),
});
