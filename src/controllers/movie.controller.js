import { movieService } from "../services/movie.service.js";

export const movieController = {
  async findAll(request, response, next) {
    // gọi service
    const movies = await movieService.findAll();
    response.json({
      status: "success",
      statusCode: 200,
      message: "Lấy danh sách Article thành công",
      data: movies,
    });
  },
};
