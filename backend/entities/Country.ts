import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Author } from './Author.js';

@Entity('countries', { schema: 'bokdb' })
export class Country {
   @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
      id!: number;

   @Column('varchar', { name: 'name', length: 255 })
      name!: string;

   @OneToMany(() => Author, (authors) => authors.country)
      authors!: Author[];
}
