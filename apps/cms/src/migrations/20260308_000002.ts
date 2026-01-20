import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_search_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_search_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "search_id";

    DROP TABLE IF EXISTS "search_categories" CASCADE;
    DROP TABLE IF EXISTS "search_rels" CASCADE;
    DROP TABLE IF EXISTS "search" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "search" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "priority" numeric,
      "slug" varchar,
      "meta_title" varchar,
      "meta_description" varchar,
      "meta_image_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "search_categories" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "relation_to" varchar,
      "category_i_d" varchar,
      "title" varchar
    );

    CREATE TABLE "search_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "posts_id" integer
    );

    ALTER TABLE "search_categories"
      ADD CONSTRAINT "search_categories_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "search"
      ADD CONSTRAINT "search_meta_image_id_media_id_fk"
      FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;

    ALTER TABLE "search_rels"
      ADD CONSTRAINT "search_rels_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "search_rels"
      ADD CONSTRAINT "search_rels_posts_fk"
      FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
    CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
    CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
    CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
    CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
    CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
    CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
    CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
    CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
    CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "search_id" integer;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_search_fk"
      FOREIGN KEY ("search_id") REFERENCES "public"."search"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "payload_locked_documents_rels_search_id_idx"
      ON "payload_locked_documents_rels" USING btree ("search_id");
  `)
}
