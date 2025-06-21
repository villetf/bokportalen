import express from 'express';
import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';

export class BookController {
   // static async getAll(req: Request, res: Response) {
   //    const users = await AppDataSource.getRepository(User).find();
   //    res.json(users);
   // }

   // static async create(req: Request, res: Response) {
   //    const user = AppDataSource.getRepository(User).create(req.body);
   //    const result = await AppDataSource.getRepository(User).save(user);
   //    res.status(201).json(result);
   // }
}