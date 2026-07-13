import express from "express";
import rootRouter from "./src/routers/root.router.js";
import { appError } from "./src/common/helpers/appError.helper.js";
import { logAPI } from "./src/common/middleware/log-api.middleware.js";
import cookieParser from "cookie-parser";
import { PORT } from "./src/common/constants/app.constant.js";

const app = express();

app.use(logAPI);
app.use(cookieParser()) // middle

app.use(express.json()); // middleware để parse body của request có định dạng json

// định ngĩa API
app.use("/api", rootRouter);

app.use(appError);

app.listen(PORT, () => {
  // sau khi server chạy thành công, sẽ tiếp tục thực thi các logic code bên trong callback
  console.log(`Server online at port ${PORT}`);
});
