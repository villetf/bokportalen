import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Language } from './entities/Language.js';
import { Author } from './entities/Author.js';
import { Book } from './entities/Book.js';
import { Country } from './entities/Country.js';
import { Genre } from './entities/Genre.js';
dotenv.config();

export const AppDataSource = new DataSource({
   type: 'mariadb',
   host: process.env.DB_HOST,
   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
   username: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   synchronize: true,
   logging: false,
   entities: [Author, Book, Country, Genre, Language],
   migrations: [],
   subscribers: [],
});