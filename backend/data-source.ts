import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Language } from './entities/Language.js';
import { Author } from './entities/Author.js';
import { Book } from './entities/Book.js';
import { Country } from './entities/Country.js';
import { Genre } from './entities/Genre.js';
import { User } from './entities/User.js';
import { UserBook } from './entities/UserBook.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AppDataSource = new DataSource({
   type: 'mariadb',
   host: process.env.DB_HOST,
   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
   username: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   synchronize: false,
   logging: true,
   entities: [Author, Book, Country, Genre, Language, User, UserBook],
   migrations: [__dirname + '/migrations/**/*.{ts,js}'],
   migrationsRun: false,
   subscribers: []
});