import express from "express";
import rootRouter from "./src/routers/root.router.js";
import { appError } from './src/common/helpers/appError.helper.js';
import { logAPI } from './src/common/middleware/log-api.middleware.js';

const app = express();

app.use(logAPI)

// định ngĩa API
app.use("/api", rootRouter);



app.use(appError)

const PORT = 3069;
app.listen(PORT, () => {
  // sau khi server chạy thành công, sẽ tiếp tục thực thi các logic code bên trong callback
  console.log(`Server online at port ${PORT}`);
});
