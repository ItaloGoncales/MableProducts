import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1773107321073 implements MigrationInterface {
    name = 'CreateInitialSchema1773107321073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_options" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "name" character varying(100) NOT NULL, "values" text array NOT NULL, "position" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_3916b02fb43aa725f8167c718e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_variants_availability_enum" AS ENUM('inStock', 'outOfStock', 'preOrder')`);
        await queryRunner.query(`CREATE TABLE "product_variants" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "sku" character varying(100) NOT NULL, "name" character varying(500) NOT NULL, "description" text, "priceRetail" numeric(10,2) NOT NULL, "options" jsonb NOT NULL DEFAULT '{}', "eachCount" integer, "eachSize" numeric(10,2), "eachSizeUnit" character varying(20), "eachName" character varying(50), "eachNamePlural" character varying(50), "availability" "public"."product_variants_availability_enum" NOT NULL DEFAULT 'inStock', "position" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_46f236f21640f9da218a063a866" UNIQUE ("sku"), CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('available', 'draft', 'archived')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "status" "public"."products_status_enum" NOT NULL DEFAULT 'draft', "sellerId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_options" ADD CONSTRAINT "FK_96d8f73d05e681974c07b99ee5d" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`);
        await queryRunner.query(`ALTER TABLE "product_options" DROP CONSTRAINT "FK_96d8f73d05e681974c07b99ee5d"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
        await queryRunner.query(`DROP TYPE "public"."product_variants_availability_enum"`);
        await queryRunner.query(`DROP TABLE "product_options"`);
    }

}
