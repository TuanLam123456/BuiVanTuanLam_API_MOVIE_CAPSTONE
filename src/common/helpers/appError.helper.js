import { json } from "sequelize";
import { responseErr } from "./response.helper.js";

// middleware bắt lỗi, không được phép xảy ra lỗi mà không được xử lý, không được tồn tại lỗi từ logic
export const appError = (err, req, res, next) => {
  console.error("Lỗi ở middleware đặc biệt xử lý lỗi:", err);
  console.log("app err",{
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack
  })
  const response = responseErr(err?.message, err?.statusCode, err?.stack);

  res.status(response.statusCode).json(response);
};