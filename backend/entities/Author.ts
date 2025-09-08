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
import { Exclude, Expose } from 'class-transformer';

@Index('country_id', ['countryId'], {})
@Index('idx_last_name', ['lastName'], {})
@Entity('authors', { schema: 'bokdb' })
export class Author {
   @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
   @Expose()
      id!: number;

   @Column('varchar', { name: 'first_name', nullable: true, length: 255 })
   @Expose()
      firstName!: string | null;

   @Column('varchar', { name: 'last_name', nullable: true, length: 255 })
   @Expose()
      lastName!: string | null;

   @Column('enum', {
      name: 'gender',
      nullable: true,
      enum: ['Man', 'Kvinna', 'Annat'],
   })
   @Expose()
      gender!: 'Man' | 'Kvinna' | 'Annat' | null;

   @Column('int', { name: 'birth_year', nullable: true })
   @Expose()
      birthYear!: number | null;

   @Column('int', { name: 'country_id', nullable: true })
      @Exclude({ toPlainOnly: true })
      countryId!: number | null;

   @Column('varchar', { name: 'image_link', nullable: true, length: 255 })
   @Expose()
      imageLink!: string | null;

   @ManyToMany(() => Book, (books) => books.authors)
      books!: Book[];

   @ManyToOne(() => Country, (countries) => countries.authors, {
      onDelete: 'SET NULL',
      onUpdate: 'RESTRICT',
   })
   @JoinColumn([{ name: 'country_id', referencedColumnName: 'id' }])
   @Expose()
      country!: Country | null;
}
