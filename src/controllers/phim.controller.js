import { phimService } from "../services/phim.service.js";

export const phimController = {
  async findAll(request, response, next) {
    // gọi service
    const movies = await phimService.findAll();
    response.json({
      status: "success",
      statusCode: 200,
      message: "Lấy danh sách Article thành công",
      data: movies,
    });
  },
};
