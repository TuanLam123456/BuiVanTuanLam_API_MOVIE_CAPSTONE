import { movieService } from "../services/movie.service.js";

export const movieController = {
  findAll(request, response, next) {
    // gọi service
    const movies = movieService.findAll()
    response.json(movies)
  },
};
