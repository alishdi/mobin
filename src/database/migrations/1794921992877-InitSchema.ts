import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1794921992877 implements MigrationInterface {
    name = 'InitSchema1794921992877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone" character varying(15) NOT NULL, "firstName" character varying(100), "lastName" character varying(100), "nationalCode" character varying, "isVerified" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."phone" IS 'شماره موبایل کاربر'; COMMENT ON COLUMN "users"."firstName" IS 'نام کاربر'; COMMENT ON COLUMN "users"."lastName" IS 'نام خانوادگی کاربر'; COMMENT ON COLUMN "users"."nationalCode" IS 'کد ملی (رمزنگاری شده)'; COMMENT ON COLUMN "users"."isVerified" IS 'آیا احراز هویت شده؟'; COMMENT ON COLUMN "users"."isActive" IS 'آیا کاربر فعال است؟'; COMMENT ON COLUMN "users"."created_at" IS 'تاریخ ایجاد'; COMMENT ON COLUMN "users"."updated_at" IS 'تاریخ آخرین ویرایش'; COMMENT ON COLUMN "users"."deletedAt" IS 'تاریخ حذف نرم'`);
        await queryRunner.query(`CREATE INDEX "IDX_a000cca60bcf04454e72769949" ON "users"  ("phone") `);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brand" character varying(100) NOT NULL, "model" character varying(100) NOT NULL, "year" integer NOT NULL, "cashPrice" numeric(15,0) NOT NULL, "installmentPrice" numeric(15,0) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "imageUrl" character varying, "options" jsonb, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id")); COMMENT ON COLUMN "vehicles"."brand" IS 'برند خودرو'; COMMENT ON COLUMN "vehicles"."model" IS 'مدل خودرو'; COMMENT ON COLUMN "vehicles"."year" IS 'سال ساخت'; COMMENT ON COLUMN "vehicles"."cashPrice" IS 'قیمت نقدی (تومان)'; COMMENT ON COLUMN "vehicles"."installmentPrice" IS 'قیمت اقساطی (تومان)'; COMMENT ON COLUMN "vehicles"."stock" IS 'موجودی انبار'; COMMENT ON COLUMN "vehicles"."imageUrl" IS 'لینک تصویر اصلی'; COMMENT ON COLUMN "vehicles"."options" IS 'آپشن‌های خودرو'; COMMENT ON COLUMN "vehicles"."isActive" IS 'آیا برای فروش فعال است؟'`);
        await queryRunner.query(`CREATE INDEX "IDX_2af2b1382c2b8ecbbd77792319" ON "vehicles"  ("brand") `);
        await queryRunner.query(`CREATE TYPE "public"."contracts_status_enum" AS ENUM('pending', 'approved', 'active', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "contracts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contractNumber" character varying NOT NULL, "downPayment" numeric(15,0) NOT NULL, "installmentCount" integer NOT NULL, "installmentAmount" numeric(15,0) NOT NULL, "interestRate" numeric(5,2) NOT NULL, "status" "public"."contracts_status_enum" NOT NULL DEFAULT ''pending'', "startDate" date, "endDate" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "vehicle_id" uuid, CONSTRAINT "UQ_375897948211b379ad8726c5e63" UNIQUE ("contractNumber"), CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id")); COMMENT ON COLUMN "contracts"."contractNumber" IS 'شماره قرارداد'; COMMENT ON COLUMN "contracts"."downPayment" IS 'پیش‌پرداخت (تومان)'; COMMENT ON COLUMN "contracts"."installmentCount" IS 'تعداد اقساط'; COMMENT ON COLUMN "contracts"."installmentAmount" IS 'مبلغ هر قسط (تومان)'; COMMENT ON COLUMN "contracts"."interestRate" IS 'نرخ سود سالانه (درصد)'; COMMENT ON COLUMN "contracts"."status" IS 'وضعیت قرارداد'; COMMENT ON COLUMN "contracts"."startDate" IS 'تاریخ شروع قرارداد'; COMMENT ON COLUMN "contracts"."endDate" IS 'تاریخ پایان قرارداد'`);
        await queryRunner.query(`CREATE INDEX "IDX_375897948211b379ad8726c5e6" ON "contracts"  ("contractNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_78fd0b9f9cbfc7869ca4d9f5e3" ON "contracts"  ("status") `);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'success', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_paymenttype_enum" AS ENUM('down_payment', 'installment', 'late_fee')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionId" character varying NOT NULL, "amount" numeric(15,0) NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT ''pending'', "paymentType" "public"."payments_paymenttype_enum" NOT NULL, "installmentNumber" integer, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "contract_id" uuid, CONSTRAINT "UQ_c39d78e8744809ece8ca95730e2" UNIQUE ("transactionId"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")); COMMENT ON COLUMN "payments"."transactionId" IS 'شناسه یکتای تراکنش'; COMMENT ON COLUMN "payments"."amount" IS 'مبلغ پرداختی (تومان)'; COMMENT ON COLUMN "payments"."status" IS 'وضعیت پرداخت'; COMMENT ON COLUMN "payments"."paymentType" IS 'نوع پرداخت'; COMMENT ON COLUMN "payments"."installmentNumber" IS 'شماره قسط (برای پرداخت اقساط)'; COMMENT ON COLUMN "payments"."description" IS 'توضیحات'`);
        await queryRunner.query(`CREATE INDEX "IDX_c39d78e8744809ece8ca95730e" ON "payments"  ("transactionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_32b41cdb985a296213e9a928b5" ON "payments"  ("status") `);
        await queryRunner.query(`ALTER TABLE "contracts" ADD CONSTRAINT "FK_4e1de36dfe48eb55999a95e1056" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contracts" ADD CONSTRAINT "FK_e6411f826c82d088e03df826791" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_52fc2356fb8c211c93d4b1496f3" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_52fc2356fb8c211c93d4b1496f3"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"`);
        await queryRunner.query(`ALTER TABLE "contracts" DROP CONSTRAINT "FK_e6411f826c82d088e03df826791"`);
        await queryRunner.query(`ALTER TABLE "contracts" DROP CONSTRAINT "FK_4e1de36dfe48eb55999a95e1056"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32b41cdb985a296213e9a928b5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c39d78e8744809ece8ca95730e"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_paymenttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78fd0b9f9cbfc7869ca4d9f5e3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_375897948211b379ad8726c5e6"`);
        await queryRunner.query(`DROP TABLE "contracts"`);
        await queryRunner.query(`DROP TYPE "public"."contracts_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2af2b1382c2b8ecbbd77792319"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
