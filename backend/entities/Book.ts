import {
   Column,
   Entity,
   Index,
   JoinColumn,
   JoinTable,
   ManyToMany,
   ManyToOne,
   PrimaryGeneratedColumn,
} from 'typeorm';
import { Author } from './Author.js';
import { Language } from './Language.js';
import { Genre } from './Genre.js';

@Index('idx_title', ['title'], {})
@Index('idx_language_id', ['languageId'], {})
@Index('idx_original_language_id', ['originalLanguageId'], {})
@Index('idx_genre_id', ['genreId'], {})
@Entity('books', { schema: 'bokdb' })
export class Book {
   @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
      id!: number;

   @Column('varchar', { name: 'title', length: 255 })
      title!: string;

   @Column('int', { name: 'year_written', nullable: true })
      yearWritten!: number | null;

   @Column('int', { name: 'language_id', nullable: true })
      languageId!: number | null;

   @Column('int', { name: 'original_language_id', nullable: true })
      originalLanguageId!: number | null;

   @Column('int', { name: 'genre_id', nullable: true })
      genreId!: number | null;

   @Column('varchar', { name: 'format', nullable: true, length: 255 })
      format!: string | null;

   @Column('bigint', { name: 'isbn', nullable: true })
      isbn!: number | null;

   @Column('varchar', { name: 'status', nullable: true, length: 255 })
      status!: string | null;

   @Column('float', { name: 'rating', nullable: true, precision: 12 })
      rating!: number | null;

   @Column('boolean', { name: 'is_deleted', nullable: true })
      isDeleted!: boolean | null;

   @Column('int', { name: 'copies', nullable: true })
      copies!: number | null;

   @Column('datetime', { name: 'created_at', nullable: true })
      createdAt!: Date | null;

   @Column('boolean', { name: 'added_with_scanner', nullable: true })
      addedWithScanner!: boolean | null;

   @ManyToMany(() => Author, (authors) => authors.books)
   @JoinTable({
      name: 'book_authors',
      joinColumns: [{ name: 'book_id', referencedColumnName: 'id' }],
      inverseJoinColumns: [{ name: 'author_id', referencedColumnName: 'id' }],
      schema: 'bokdb',
   })
      authors!: Author[];

   @ManyToOne(() => Language, (languages) => languages.books, {
      onDelete: 'SET NULL',
      onUpdate: 'RESTRICT',
   })
   @JoinColumn([{ name: 'language_id', referencedColumnName: 'id' }])
      language!: Language | null;

   @ManyToOne(() => Language, (languages) => languages.books2, {
      onDelete: 'SET NULL',
      onUpdate: 'RESTRICT',
   })
   @JoinColumn([{ name: 'original_language_id', referencedColumnName: 'id' }])
      originalLanguage!: Language | null;

   @ManyToOne(() => Genre, (genres) => genres.books, {
      onDelete: 'SET NULL',
      onUpdate: 'RESTRICT',
   })
   @JoinColumn([{ name: 'genre_id', referencedColumnName: 'id' }])
      genre!: Genre | null;
}
