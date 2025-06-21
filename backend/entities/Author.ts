import {
   Column,
   Entity,
   Index,
   JoinColumn,
   ManyToMany,
   ManyToOne,
   PrimaryGeneratedColumn,
} from 'typeorm';
import { Book } from './Book.js';
import { Country } from './Country.js';

@Index('country_id', ['countryId'], {})
@Index('idx_last_name', ['lastName'], {})
@Entity('authors', { schema: 'bokdb' })
export class Author {
   @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
      id!: number;

   @Column('varchar', { name: 'first_name', nullable: true, length: 255 })
      firstName!: string | null;

   @Column('varchar', { name: 'last_name', nullable: true, length: 255 })
      lastName!: string | null;

   @Column('enum', {
      name: 'gender',
      nullable: true,
      enum: ['Man', 'Kvinna', 'Annat'],
   })
      gender!: 'Man' | 'Kvinna' | 'Annat' | null;

   @Column('int', { name: 'birth_year', nullable: true })
      birthYear!: number | null;

   @Column('int', { name: 'country_id', nullable: true })
      countryId!: number | null;

   @ManyToMany(() => Book, (books) => books.authors)
      books!: Book[];

   @ManyToOne(() => Country, (countries) => countries.authors, {
      onDelete: 'SET NULL',
      onUpdate: 'RESTRICT',
   })
   @JoinColumn([{ name: 'country_id', referencedColumnName: 'id' }])
      country!: Country;
}
