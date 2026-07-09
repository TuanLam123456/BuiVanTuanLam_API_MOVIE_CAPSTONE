import { prisma } from "../common/prisma/connect.prisma.js"

export const movieService = {
    async findAll() {
        const res = await prisma.phim.findMany()
        return res
    }
}