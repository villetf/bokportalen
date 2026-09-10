import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupportMultipleGenres1788805365568 implements MigrationInterface {
   name = 'SupportMultipleCategories1788805365568';

   public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('CREATE TABLE `book_genres` (`book_id` int NOT NULL, `genre_id` int NOT NULL, INDEX `IDX_dc378b8311ff85f0dd38f16309` (`book_id`), INDEX `IDX_43ff7d87d7506e768ca6491a1d` (`genre_id`), PRIMARY KEY (`book_id`, `genre_id`)) ENGINE=InnoDB');

      await queryRunner.query('ALTER TABLE `book_genres` ADD CONSTRAINT `FK_dc378b8311ff85f0dd38f163090` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');

      await queryRunner.query('ALTER TABLE `book_genres` ADD CONSTRAINT `FK_43ff7d87d7506e768ca6491a1dd` FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION');

      await queryRunner.query('INSERT INTO book_genres (book_id, genre_id) SELECT id, genre_id FROM books WHERE genre_id IS NOT NULL');

      await queryRunner.query('ALTER TABLE `books` DROP FOREIGN KEY `FK_3b94b035d80d7564abd012014c8`');

      await queryRunner.query('DROP INDEX `idx_genre_id` ON `books`');

      await queryRunner.query('ALTER TABLE `books` DROP COLUMN `genre_id`');
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `books` ADD `genre_id` int NULL');

      await queryRunner.query('UPDATE books b JOIN book_genres bg ON b.id = bg.book_id SET b.genre_id = bg.genre_id');

      await queryRunner.query('CREATE INDEX `idx_genre_id` ON `books` (`genre_id`)');

      await queryRunner.query('ALTER TABLE `books` ADD CONSTRAINT `FK_3b94b035d80d7564abd012014c8` FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT');

      await queryRunner.query('ALTER TABLE `book_genres` DROP FOREIGN KEY `FK_43ff7d87d7506e768ca6491a1dd`');

      await queryRunner.query('ALTER TABLE `book_genres` DROP FOREIGN KEY `FK_dc378b8311ff85f0dd38f163090`');

      await queryRunner.query('DROP INDEX `IDX_43ff7d87d7506e768ca6491a1d` ON `book_genres`');

      await queryRunner.query('DROP INDEX `IDX_dc378b8311ff85f0dd38f16309` ON `book_genres`');

      await queryRunner.query('DROP TABLE `book_genres`');
   }
}
