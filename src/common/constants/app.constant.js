import "dotenv/config";

export const DATABASE_URL = process.env.DATABASE_URL;
export const PORT = process.env.PORT;
export const JWT_SECRET_KEY = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;