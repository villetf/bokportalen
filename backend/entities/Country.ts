import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Author } from './Author.js';
import { Expose } from 'class-transformer';

@Entity('countries', { schema: 'bokdb' })
export class Country {
   @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
   @Expose()
      id!: number;

   @Column('varchar', { name: 'name', length: 255 })
   @Expose()
      name!: string;

   @OneToMany(() => Author, (authors) => authors.country)
   @Expose()
      authors!: Author[];
}
