import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';


@Entity('users', { schema: 'bokdb' })
export class User {
   @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
      id!: number;

   @Index({ unique: true })
   @Column('varchar', { name: 'firebase_uuid', length: 255 })
      firebaseUuid!: string;

   @Column('varchar', { name: 'email', length: 255 })
      email!: string;

   @Column('varchar', { name: 'display_name', length: 255, nullable: true })
      displayName!: string | null;

   @Column({ type: 'boolean', name: 'show_real_covers', default: true })
      showRealCovers!: boolean;

   @CreateDateColumn({ name: 'created_at' })
      createdAt!: Date;

   @UpdateDateColumn({ name: 'updated_at' })
      updatedAt!: Date;
}