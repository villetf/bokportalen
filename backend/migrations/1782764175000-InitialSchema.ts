import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1782764175000 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
         CREATE TABLE countries (
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            PRIMARY KEY (id)
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
      `);

      await queryRunner.query(`
         CREATE TABLE languages (
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            PRIMARY KEY (id)
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
      `);

      await queryRunner.query(`
         CREATE TABLE genres (
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(255) DEFAULT NULL,
            PRIMARY KEY (id)
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
      `);

      await queryRunner.query(`
         CREATE TABLE authors (
            id int(11) NOT NULL AUTO_INCREMENT,
            first_name varchar(255) DEFAULT NULL,
            last_name varchar(255) DEFAULT NULL,
            gender enum('Man','Kvinna','Annat') DEFAULT NULL,
            birth_year int(11) DEFAULT NULL CHECK (birth_year >= -1000 and birth_year <= 2100),
            country_id int(11) DEFAULT NULL,
            image_link varchar(255) DEFAULT NULL,
            PRIMARY KEY (id),
            KEY idx_last_name (last_name),
            KEY country_id (country_id),
            CONSTRAINT FK_f5b2749f4db2ee721085df95d2e FOREIGN KEY (country_id) REFERENCES countries (id) ON DELETE SET NULL
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
      `);

      await queryRunner.query(`
         CREATE TABLE books (
            id int(11) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            year_written int(11) DEFAULT NULL CHECK (year_written >= -1000 and year_written <= 2100),
            language_id int(11) DEFAULT NULL,
            original_language_id int(11) DEFAULT NULL,
            genre_id int(11) DEFAULT NULL,
            format varchar(255) DEFAULT NULL,
            isbn bigint(20) DEFAULT NULL,
            status varchar(255) DEFAULT NULL,
            rating float DEFAULT NULL,
            is_deleted tinyint(4) DEFAULT NULL,
            copies int(11) DEFAULT NULL,
            added_with_scanner tinyint(4) DEFAULT NULL,
            created_at datetime DEFAULT NULL,
            cover_link varchar(255) DEFAULT NULL,
            PRIMARY KEY (id),
            KEY idx_title (title),
            KEY idx_language_id (language_id),
            KEY idx_original_language_id (original_language_id),
            KEY idx_genre_id (genre_id),
            CONSTRAINT FK_3164a2958d73d8cdebe5204c838 FOREIGN KEY (language_id) REFERENCES languages (id) ON DELETE SET NULL,
            CONSTRAINT FK_3b94b035d80d7564abd012014c8 FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE SET NULL,
            CONSTRAINT FK_8f517d47f418338de3c841a2dc0 FOREIGN KEY (original_language_id) REFERENCES languages (id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
            `);


      await queryRunner.query(`
         CREATE TABLE book_authors (
            book_id int(11) NOT NULL,
            author_id int(11) NOT NULL,
            PRIMARY KEY (book_id,author_id),
            KEY IDX_1d68802baf370cd6818cad7a50 (book_id),
            KEY IDX_6fb8ac32a0a0bbca076b2cf7c5 (author_id),
            CONSTRAINT FK_1d68802baf370cd6818cad7a503 FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT FK_6fb8ac32a0a0bbca076b2cf7c5a FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE NO ACTION ON UPDATE NO ACTION
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
      `);
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
         DROP TABLE book_authors;
      `);

      await queryRunner.query(`
         DROP TABLE books;
      `);

      await queryRunner.query(`
         DROP TABLE authors;
      `);

      await queryRunner.query(`
         DROP TABLE genres;
      `);

      await queryRunner.query(`
         DROP TABLE languages;
      `);

      await queryRunner.query(`
         DROP TABLE countries;
      `);
   }
}
