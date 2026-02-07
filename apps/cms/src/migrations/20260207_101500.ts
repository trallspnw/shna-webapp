import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_email_sends_fallback_reason'
      ) THEN
        CREATE TYPE "public"."enum_email_sends_fallback_reason" AS ENUM(
          'template_not_found',
          'template_inactive',
          'missing_placeholders',
          'render_error',
          'skipped_already_sent'
        );
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'enum_email_sends_error_code' AND e.enumlabel = 'template_inactive'
      ) THEN
        ALTER TYPE "public"."enum_email_sends_error_code" ADD VALUE 'template_inactive';
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'enum_email_sends_error_code' AND e.enumlabel = 'render_error'
      ) THEN
        ALTER TYPE "public"."enum_email_sends_error_code" ADD VALUE 'render_error';
      END IF;
    END $$;

    ALTER TABLE "email_sends"
      ADD COLUMN IF NOT EXISTS "template_attempted" boolean,
      ADD COLUMN IF NOT EXISTS "template_used" boolean,
      ADD COLUMN IF NOT EXISTS "fallback_reason" "public"."enum_email_sends_fallback_reason",
      ADD COLUMN IF NOT EXISTS "missing_placeholders" jsonb,
      ADD COLUMN IF NOT EXISTS "placeholder_snapshot" jsonb;

    DROP TABLE IF EXISTS "email_sends_texts";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_sends"
      DROP COLUMN IF EXISTS "template_attempted",
      DROP COLUMN IF EXISTS "template_used",
      DROP COLUMN IF EXISTS "fallback_reason",
      DROP COLUMN IF EXISTS "missing_placeholders",
      DROP COLUMN IF EXISTS "placeholder_snapshot";
  `)
}
