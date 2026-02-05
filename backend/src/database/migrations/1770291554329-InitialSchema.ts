import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770291554329 implements MigrationInterface {
    name = 'InitialSchema1770291554329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shopId" uuid NOT NULL, "email" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "phone" character varying, "notes" text, "otpHash" character varying, "otpExpiry" TIMESTAMP WITH TIME ZONE, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_1f1d78b1d59e9b085c396f1eb2d" UNIQUE ("shopId", "email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shopId" uuid NOT NULL, "customerId" uuid NOT NULL, "staffId" uuid, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'CONFIRMED', "startTime" TIMESTAMP WITH TIME ZONE NOT NULL, "endTime" TIMESTAMP WITH TIME ZONE NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "totalDuration" integer NOT NULL, "customerNotes" text, "staffNotes" text, "cancelledAt" TIMESTAMP WITH TIME ZONE, "cancelReason" character varying, "cancelledBy" character varying, "reminderSent" boolean NOT NULL DEFAULT false, "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_67b9cd20f987fc6dc70f7cd283" ON "bookings" ("customerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_60c3102d8e68b4d65bd5fa32a0" ON "bookings" ("staffId", "startTime") `);
        await queryRunner.query(`CREATE INDEX "IDX_c0131d265de612d0190bcdc90f" ON "bookings" ("shopId", "startTime") `);
        await queryRunner.query(`CREATE TABLE "booking_services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "bookingId" uuid NOT NULL, "serviceId" uuid NOT NULL, "serviceName" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "duration" integer NOT NULL, "sortOrder" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_8997bf4d0728c8740c87694d59a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shopId" uuid NOT NULL, "categoryId" uuid, "name" character varying NOT NULL, "nameEn" character varying, "description" text, "descriptionEn" text, "duration" integer NOT NULL, "price" numeric(10,2) NOT NULL, "bufferTime" integer, "image" character varying, "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shopId" uuid NOT NULL, "name" character varying NOT NULL, "nameEn" character varying, "description" text, "descriptionEn" text, "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shopId" uuid, "name" character varying NOT NULL, "description" character varying, "permissions" text NOT NULL DEFAULT '', "isSystem" boolean NOT NULL DEFAULT false, "isDefault" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shop_working_hours" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shopId" uuid NOT NULL, "dayOfWeek" integer NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "isOpen" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_d1b937153089a0f1ca11f0f89fd" UNIQUE ("shopId", "dayOfWeek"), CONSTRAINT "PK_cc37238e7c6e51fe00f3b41b6d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shop_special_days" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shopId" uuid NOT NULL, "date" date NOT NULL, "isClosed" boolean NOT NULL DEFAULT true, "startTime" character varying, "endTime" character varying, "reason" character varying, CONSTRAINT "UQ_0ea589b4d1a2f87636bff386928" UNIQUE ("shopId", "date"), CONSTRAINT "PK_68483745480857473a6022cfd81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" text, "email" character varying NOT NULL, "phone" character varying, "address" character varying, "city" character varying, "postalCode" character varying, "country" character varying NOT NULL DEFAULT 'GR', "latitude" double precision, "longitude" double precision, "timezone" character varying NOT NULL DEFAULT 'Europe/Athens', "settings" jsonb NOT NULL DEFAULT '{}', "logo" character varying, "coverImage" character varying, "images" text NOT NULL DEFAULT '', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_3c6aaa6607d287de99815e60b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "dayOfWeek" integer NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "isWorking" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_800f1a454c6add1a5a0f9777c77" UNIQUE ("userId", "dayOfWeek"), CONSTRAINT "PK_6481357d75d7a163986d89a6a74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_time_blocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "isRecurring" boolean NOT NULL DEFAULT false, "dayOfWeek" integer, "date" date, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "reason" character varying, CONSTRAINT "PK_0d181a1ca4a9a00d877a5aa20aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "shopId" uuid, "roleId" uuid NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "phone" character varying, "avatar" character varying, "is2FAEnabled" boolean NOT NULL DEFAULT false, "totpSecret" character varying, "isActive" boolean NOT NULL DEFAULT true, "lastLoginAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_logs_type_enum" AS ENUM('BOOKING_CONFIRMATION', 'BOOKING_REMINDER', 'BOOKING_CANCELLATION', 'BOOKING_UPDATED')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_logs_channel_enum" AS ENUM('EMAIL', 'SMS', 'WHATSAPP', 'VIBER')`);
        await queryRunner.query(`CREATE TABLE "notification_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "bookingId" uuid, "customerId" uuid, "type" "public"."notification_logs_type_enum" NOT NULL, "channel" "public"."notification_logs_channel_enum" NOT NULL, "recipient" character varying NOT NULL, "status" character varying NOT NULL, "errorMessage" character varying, "sentAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_19c524e644cdeaebfcffc284871" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fab4ba73f118758b035c5a4ace" ON "notification_logs" ("bookingId") `);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "customerId" uuid, "token" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4fadc32acd39d2a16e14140ef4" ON "refresh_tokens" ("customerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId") `);
        await queryRunner.query(`CREATE TABLE "service_staff" ("serviceId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_f829e6195413227320cb24bd6e6" PRIMARY KEY ("serviceId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f1d36946e9079b1a4a06e11621" ON "service_staff" ("serviceId") `);
        await queryRunner.query(`CREATE INDEX "IDX_152acc9818d17d2f126575f310" ON "service_staff" ("userId") `);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_45135fa52dfd3223f9b1fb62396" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_56a17e5244711d61bb98e8275e7" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_c3e05cfa3bde93838eb75565326" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_services" ADD CONSTRAINT "FK_9a9d697fbd86c5285ed1662c7c7" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_services" ADD CONSTRAINT "FK_6670d3e3d8c010bcdc3bc7a4be2" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_e773bd43e120f8a21f795b91502" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_13d598bf4d052adfce75b24d44a" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_e4f552c05d548f0d95086b8f23c" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop_working_hours" ADD CONSTRAINT "FK_b13bf96e738497d68267f8039b7" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop_special_days" ADD CONSTRAINT "FK_aa8c226f974f3efe17bfaf88bfa" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_schedules" ADD CONSTRAINT "FK_07f6b47bf0635a55438926ec738" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_time_blocks" ADD CONSTRAINT "FK_8c286ca52242dcdae1433788512" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_7680babafb8b9ca907bfbd142c5" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_staff" ADD CONSTRAINT "FK_f1d36946e9079b1a4a06e116213" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "service_staff" ADD CONSTRAINT "FK_152acc9818d17d2f126575f310f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_staff" DROP CONSTRAINT "FK_152acc9818d17d2f126575f310f"`);
        await queryRunner.query(`ALTER TABLE "service_staff" DROP CONSTRAINT "FK_f1d36946e9079b1a4a06e116213"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_7680babafb8b9ca907bfbd142c5"`);
        await queryRunner.query(`ALTER TABLE "user_time_blocks" DROP CONSTRAINT "FK_8c286ca52242dcdae1433788512"`);
        await queryRunner.query(`ALTER TABLE "user_schedules" DROP CONSTRAINT "FK_07f6b47bf0635a55438926ec738"`);
        await queryRunner.query(`ALTER TABLE "shop_special_days" DROP CONSTRAINT "FK_aa8c226f974f3efe17bfaf88bfa"`);
        await queryRunner.query(`ALTER TABLE "shop_working_hours" DROP CONSTRAINT "FK_b13bf96e738497d68267f8039b7"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_e4f552c05d548f0d95086b8f23c"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_13d598bf4d052adfce75b24d44a"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_e773bd43e120f8a21f795b91502"`);
        await queryRunner.query(`ALTER TABLE "booking_services" DROP CONSTRAINT "FK_6670d3e3d8c010bcdc3bc7a4be2"`);
        await queryRunner.query(`ALTER TABLE "booking_services" DROP CONSTRAINT "FK_9a9d697fbd86c5285ed1662c7c7"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_c3e05cfa3bde93838eb75565326"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_56a17e5244711d61bb98e8275e7"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_45135fa52dfd3223f9b1fb62396"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_152acc9818d17d2f126575f310"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f1d36946e9079b1a4a06e11621"`);
        await queryRunner.query(`DROP TABLE "service_staff"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4fadc32acd39d2a16e14140ef4"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fab4ba73f118758b035c5a4ace"`);
        await queryRunner.query(`DROP TABLE "notification_logs"`);
        await queryRunner.query(`DROP TYPE "public"."notification_logs_channel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_logs_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "user_time_blocks"`);
        await queryRunner.query(`DROP TABLE "user_schedules"`);
        await queryRunner.query(`DROP TABLE "shops"`);
        await queryRunner.query(`DROP TABLE "shop_special_days"`);
        await queryRunner.query(`DROP TABLE "shop_working_hours"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TABLE "booking_services"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0131d265de612d0190bcdc90f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60c3102d8e68b4d65bd5fa32a0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_67b9cd20f987fc6dc70f7cd283"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP TABLE "customers"`);
    }

}
