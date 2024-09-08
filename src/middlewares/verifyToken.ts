import {Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@errors";

const verifyAccessToken = async(req: Request, res: Response, next: NextFunction) => {
  try {

    const access_token = req.headers.access_token

    if (access_token && typeof access_token === "string") {
       next()
    } else {
        res.status(400).send({
            success: false,
            message: "access_token majburiy"
        })
    }
  } catch (error: any) {
    res.status(error.status || 500).send({
      success: false,
      message: error.message || "access_token error"
    })
    return
  }
}

export {verifyAccessToken};