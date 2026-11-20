import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeBookIsbnUnique1788890000000 implements MigrationInterface {
   name = 'MakeBookIsbnUnique1788890000000';

   public async up(queryRunner: QueryRunner): Promise<void> {
      const duplicateIsbns: Array<{ isbn: string; bookIds: string }> = await queryRunner.query(`
         SELECT isbn, GROUP_CONCAT(id ORDER BY id) AS bookIds
         FROM books
         WHERE isbn IS NOT NULL
         GROUP BY isbn
         HAVING COUNT(*) > 1
      `);

      if (duplicateIsbns.length > 0) {
         const details = duplicateIsbns.map(({ isbn, bookIds }) => `${isbn} (böcker: ${bookIds})`).join(', ');
         throw new Error(`Kan inte göra ISBN unikt innan befintliga dubbletter har hanterats: ${details}`);
      }

      await queryRunner.query('ALTER TABLE `books` ADD UNIQUE INDEX `uq_books_isbn` (`isbn`)');
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE `books` DROP INDEX `uq_books_isbn`');
   }
}
