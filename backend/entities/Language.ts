import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Book } from './Book.js';


@Entity('languages', { schema: 'bokdb' })
export class Language {
   @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
      id!: number;

   @Column('varchar', { name: 'name', length: 255 })
      name!: string;

   @OneToMany('Book', (book: Book) => book.language)
      books!: Book[];

   @OneToMany('Book', (book: Book) => book.originalLanguage)
      books2!: Book[];
}
