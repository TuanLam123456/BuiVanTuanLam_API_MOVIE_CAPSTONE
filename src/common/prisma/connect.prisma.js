import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/prisma/index.js';
import { DATABASE_URL } from './../app.constant.js';

const url = new URL(DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.substring(1),
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

try {
  await prisma.$connect();
  console.log(`[PRISMA] connection has been established successfully`);
} catch (error) {
  console.error(`[PRISMA] is unable to connect to the database:`, error);
}

export { prisma };