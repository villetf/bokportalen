import {
   Column,
   CreateDateColumn,
   Entity,
   Index,
   JoinColumn,
   ManyToOne,
   PrimaryGeneratedColumn,
   UpdateDateColumn,
} from 'typeorm';
import { User } from './User.js';
import { Book } from './Book.js';

@Index('uq_user_book', ['userId', 'bookId'], { unique: true })
@Index('idx_user_id', ['userId'], {})
@Index('idx_book_id', ['bookId'], {})
@Entity('user_books', { schema: 'bokdb' })
export class UserBook {
   @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
      id!: number;

   @Column('int', { name: 'user_id' })
      userId!: number;

   @Column('int', { name: 'book_id' })
      bookId!: number;

   @Column('varchar', { name: 'status', nullable: true, length: 255 })
      status!: string | null;

   @Column('decimal', { name: 'rating', nullable: true, precision: 3, scale: 1 })
      rating!: number | null;

   @Column('int', { name: 'copies', default: 1 })
      copies!: number;

   @CreateDateColumn({ name: 'created_at' })
      createdAt!: Date;

   @UpdateDateColumn({ name: 'updated_at' })
      updatedAt!: Date;

   @ManyToOne(() => User, {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
   })
   @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
      user!: User;

   @ManyToOne(() => Book, {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
   })
   @JoinColumn([{ name: 'book_id', referencedColumnName: 'id' }])
      book!: Book;
}
