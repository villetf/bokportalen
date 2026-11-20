import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEditionPublishedYear1795192224349 implements MigrationInterface {
   name = 'AddEditionPublishedYear1795192224349';

   public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `books` ADD `edition_published_year` int NULL');
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `books` DROP COLUMN `edition_published_year`');
   }
}
