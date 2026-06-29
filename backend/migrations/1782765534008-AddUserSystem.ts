import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserSystem1782765534008 implements MigrationInterface {
   name = 'AddUserSystem1782765534008';

   public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
         CREATE TABLE \`users\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`firebase_uuid\` varchar(255) NOT NULL, 
            \`email\` varchar(255) NOT NULL, 
            \`first_name\` varchar(255) NULL, 
            \`last_name\` varchar(255) NULL, 
            \`show_real_covers\` tinyint NOT NULL DEFAULT 1, 
            \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
            \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
            UNIQUE INDEX \`IDX_8054ec53cfa98cdf7bb27762ce\` (\`firebase_uuid\`), PRIMARY KEY (\`id\`)
         ) ENGINE=InnoDB
      `);

      await queryRunner.query(`
         CREATE TABLE \`user_books\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`user_id\` int NOT NULL,
            \`book_id\` int NOT NULL,
            \`status\` varchar(255) NULL,
            \`rating\` decimal(3,1) NULL,
            \`copies\` int NOT NULL DEFAULT '1',
            \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            INDEX \`idx_book_id\` (\`book_id\`),
            INDEX \`idx_user_id\` (\`user_id\`),
            UNIQUE INDEX \`uq_user_book\` (\`user_id\`, \`book_id\`),
            PRIMARY KEY (\`id\`)
         ) ENGINE=InnoDB
      `);

      await queryRunner.query(`
         ALTER TABLE \`books\` DROP COLUMN \`status\`
      `);

      await queryRunner.query(`
         ALTER TABLE \`books\` DROP COLUMN \`rating\`
      `);
      await queryRunner.query(`
         ALTER TABLE \`books\` DROP COLUMN \`copies\`
      `);
      await queryRunner.query(`
         ALTER TABLE \`user_books\` ADD CONSTRAINT \`FK_e746bb935afa81fbcaed41036f1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT
      `);

      await queryRunner.query(`
         ALTER TABLE \`user_books\` ADD CONSTRAINT \`FK_2cf4aaa9d796a62fe330a799822\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT
      `);
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
         ALTER TABLE \`user_books\` DROP FOREIGN KEY \`FK_2cf4aaa9d796a62fe330a799822\`
      `);

      await queryRunner.query(`
         ALTER TABLE \`user_books\` DROP FOREIGN KEY \`FK_e746bb935afa81fbcaed41036f1\`
      `);

      await queryRunner.query(`
         ALTER TABLE \`books\` ADD \`copies\` int NULL
      `);

      await queryRunner.query(`
         ALTER TABLE \`books\` ADD \`rating\` float(12) NULL
      `);

      await queryRunner.query(`
         ALTER TABLE \`books\` ADD \`status\` varchar(255) NULL
      `);

      await queryRunner.query(`
         DROP INDEX \`uq_user_book\` ON \`user_books\`
      `);

      await queryRunner.query(`
         DROP INDEX \`idx_user_id\` ON \`user_books\`
      `);

      await queryRunner.query(`
         DROP INDEX \`idx_book_id\` ON \`user_books\`
      `);

      await queryRunner.query(`
         DROP TABLE \`user_books\`
      `);

      await queryRunner.query(`
         DROP INDEX \`IDX_8054ec53cfa98cdf7bb27762ce\` ON \`users\`
      `);

      await queryRunner.query(`
         DROP TABLE \`users\`
      `);
   }
}
