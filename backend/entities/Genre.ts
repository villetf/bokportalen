import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './Book.js';

@Entity('genres', { schema: 'bokdb' })
export class Genre {
   @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
      id!: number;

   @Column('varchar', { name: 'name', nullable: true, length: 255 })
      name!: string | null;

   @OneToMany(() => Book, (books) => books.genre)
      books!: Book[];
}
