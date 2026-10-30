import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeBookIsbnUnique1788890000000 implements MigrationInterface {
   name = 'MakeBookIsbnUnique1788890000000';

   public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `books` ADD UNIQUE INDEX `uq_books_isbn` (`isbn`)');
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `books` DROP INDEX `uq_books_isbn`');
   }
}
