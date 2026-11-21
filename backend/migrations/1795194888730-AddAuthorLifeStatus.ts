import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthorLifeStatus1795194888730 implements MigrationInterface {
    name = 'AddAuthorLifeStatus1795194888730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`authors\` ADD \`death_year\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`authors\` ADD \`life_status\` enum ('alive', 'deceased', 'unknown') NOT NULL DEFAULT 'unknown'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`authors\` DROP COLUMN \`life_status\``);
        await queryRunner.query(`ALTER TABLE \`authors\` DROP COLUMN \`death_year\``);
    }

}
