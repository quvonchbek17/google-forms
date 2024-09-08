import { Router } from "express";
import { FormItemsController } from "./items";
import { validate } from "@middlewares";
import { createItemDto, updateItemDto, deleteItemDto, getItemsDto } from "@middlewares";

let ItemsRouter = Router();

ItemsRouter
    .get("/get-items", validate(getItemsDto, "query"), FormItemsController.GetItems)
    .post("/create", validate(createItemDto), FormItemsController.CreateItem)
    .patch("/update", validate(updateItemDto), FormItemsController.UpdateItems)
    .delete("/delete", validate(deleteItemDto), FormItemsController.DeleteItem);

export { ItemsRouter };