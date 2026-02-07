import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_container_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_container_width_mode" AS ENUM('content', 'page');
  CREATE TYPE "public"."enum_pages_blocks_container_background_variant" AS ENUM('none', 'color', 'image');
  CREATE TYPE "public"."enum_pages_blocks_container_background_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_pages_blocks_container_outer_spacing_y" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_container_inner_padding" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_content_mode" AS ENUM('builder', 'html');
  CREATE TYPE "public"."enum__pages_v_blocks_container_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_container_width_mode" AS ENUM('content', 'page');
  CREATE TYPE "public"."enum__pages_v_blocks_container_background_variant" AS ENUM('none', 'color', 'image');
  CREATE TYPE "public"."enum__pages_v_blocks_container_background_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__pages_v_blocks_container_outer_spacing_y" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_container_inner_padding" AS ENUM('none', 'sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_version_content_mode" AS ENUM('builder', 'html');
  CREATE TYPE "public"."enum_contacts_language" AS ENUM('en', 'es');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('created', 'paid', 'expired', 'error');
  CREATE TYPE "public"."enum_order_items_item_type" AS ENUM('donation', 'membership', 'retail');
  CREATE TYPE "public"."enum_transactions_payment_type" AS ENUM('stripe', 'cash', 'check');
  CREATE TYPE "public"."enum_email_templates_status" AS ENUM('active', 'disabled');
  CREATE TYPE "public"."enum_email_sends_source" AS ENUM('template', 'inline', 'unknown');
  CREATE TYPE "public"."enum_email_sends_status" AS ENUM('queued', 'sent', 'failed');
  CREATE TYPE "public"."enum_email_sends_error_code" AS ENUM('missing_recipient', 'template_not_found', 'missing_placeholders', 'provider_failed');
  CREATE TABLE "pages_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text_block_locales" (
  	"rich_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_donation_block_suggested_amounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"amount" numeric
  );
  
  CREATE TABLE "pages_blocks_donation_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"default_amount" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_donation_block_locales" (
  	"header" varchar,
  	"description" varchar,
  	"button_label" varchar DEFAULT 'Donate',
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"phone_label" varchar DEFAULT 'Phone',
  	"address_label" varchar DEFAULT 'Address',
  	"amount_label" varchar DEFAULT 'Amount (USD)',
  	"modal_title" varchar DEFAULT 'Processing your donation...',
  	"loading_text" varchar DEFAULT 'Submitting your donation...',
  	"success_text" varchar DEFAULT 'Thank you for your donation.',
  	"error_text" varchar DEFAULT 'Something went wrong. Please try again.',
  	"checkout_name" varchar,
  	"close_label" varchar DEFAULT 'Close',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_membership_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"default_plan_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_membership_block_locales" (
  	"header" varchar,
  	"description" varchar,
  	"button_label" varchar DEFAULT 'Join',
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"phone_label" varchar DEFAULT 'Phone',
  	"address_label" varchar DEFAULT 'Address',
  	"plan_label" varchar DEFAULT 'Plan',
  	"modal_title" varchar DEFAULT 'Processing your membership...',
  	"loading_text" varchar DEFAULT 'Submitting your membership...',
  	"success_text" varchar DEFAULT 'Thank you for becoming a member.',
  	"error_text" varchar DEFAULT 'Something went wrong. Please try again.',
  	"checkout_name" varchar,
  	"close_label" varchar DEFAULT 'Close',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_subscription_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_subscription_block_locales" (
  	"header" varchar,
  	"description" varchar,
  	"button_label" varchar DEFAULT 'Subscribe',
  	"email_label" varchar DEFAULT 'Email',
  	"modal_title" varchar DEFAULT 'Subscribing...',
  	"loading_text" varchar DEFAULT 'Submitting your request...',
  	"success_text" varchar DEFAULT 'You''re subscribed.',
  	"error_text" varchar DEFAULT 'Something went wrong. Please try again.',
  	"close_label" varchar DEFAULT 'Close',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_container_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_container_columns_size" DEFAULT 'oneThird'
  );
  
  CREATE TABLE "pages_blocks_container" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width_mode" "enum_pages_blocks_container_width_mode" DEFAULT 'content',
  	"background_variant" "enum_pages_blocks_container_background_variant" DEFAULT 'none',
  	"background_color" varchar,
  	"background_fit" "enum_pages_blocks_container_background_fit" DEFAULT 'cover',
  	"overlay_strength" numeric,
  	"outer_spacing_y" "enum_pages_blocks_container_outer_spacing_y",
  	"inner_padding" "enum_pages_blocks_container_inner_padding" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_container_locales" (
  	"background_media_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text_block_locales" (
  	"rich_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_donation_block_suggested_amounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"amount" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_donation_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"default_amount" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_donation_block_locales" (
  	"header" varchar,
  	"description" varchar,
  	"button_label" varchar DEFAULT 'Donate',
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"phone_label" varchar DEFAULT 'Phone',
  	"address_label" varchar DEFAULT 'Address',
  	"amount_label" varchar DEFAULT 'Amount (USD)',
  	"modal_title" varchar DEFAULT 'Processing your donation...',
  	"loading_text" varchar DEFAULT 'Submitting your donation...',
  	"success_text" varchar DEFAULT 'Thank you for your donation.',
  	"error_text" varchar DEFAULT 'Something went wrong. Please try again.',
  	"checkout_name" varchar,
  	"close_label" varchar DEFAULT 'Close',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_membership_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"default_plan_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_membership_block_locales" (
  	"header" varchar,
  	"description" varchar,
  	"button_label" varchar DEFAULT 'Join',
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"phone_label" varchar DEFAULT 'Phone',
  	"address_label" varchar DEFAULT 'Address',
  	"plan_label" varchar DEFAULT 'Plan',
  	"modal_title" varchar DEFAULT 'Processing your membership...',
  	"loading_text" varchar DEFAULT 'Submitting your membership...',
  	"success_text" varchar DEFAULT 'Thank you for becoming a member.',
  	"error_text" varchar DEFAULT 'Something went wrong. Please try again.',
  	"checkout_name" varchar,
  	"close_label" varchar DEFAULT 'Close',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_subscription_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_subscription_block_locales" (
  	"header" varchar,
  	"description" varchar,
  	"button_label" varchar DEFAULT 'Subscribe',
  	"email_label" varchar DEFAULT 'Email',
  	"modal_title" varchar DEFAULT 'Subscribing...',
  	"loading_text" varchar DEFAULT 'Submitting your request...',
  	"success_text" varchar DEFAULT 'You''re subscribed.',
  	"error_text" varchar DEFAULT 'Something went wrong. Please try again.',
  	"close_label" varchar DEFAULT 'Close',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_container_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_container_columns_size" DEFAULT 'oneThird',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_container" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width_mode" "enum__pages_v_blocks_container_width_mode" DEFAULT 'content',
  	"background_variant" "enum__pages_v_blocks_container_background_variant" DEFAULT 'none',
  	"background_color" varchar,
  	"background_fit" "enum__pages_v_blocks_container_background_fit" DEFAULT 'cover',
  	"overlay_strength" numeric,
  	"outer_spacing_y" "enum__pages_v_blocks_container_outer_spacing_y",
  	"inner_padding" "enum__pages_v_blocks_container_inner_padding" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_container_locales" (
  	"background_media_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar,
  	"display_name" varchar,
  	"phone" varchar,
  	"address" varchar,
  	"language" "enum_contacts_language" DEFAULT 'en',
  	"campaign_id" integer,
  	"last_engaged_at" timestamp(3) with time zone,
  	"is_test" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "campaigns" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"reftag" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "subscription_topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "subscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"contact_id" integer NOT NULL,
  	"topic_id" integer NOT NULL,
  	"campaign_id" integer,
  	"is_test" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "membership_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"renewal_window_days" numeric DEFAULT 30 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "membership_plans_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "memberships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_id" integer NOT NULL,
  	"plan_id" integer NOT NULL,
  	"start_day" timestamp(3) with time zone NOT NULL,
  	"end_day" timestamp(3) with time zone NOT NULL,
  	"campaign_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"public_id" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'created',
  	"contact_id" integer NOT NULL,
  	"campaign_id" integer,
  	"lang" varchar,
  	"total_u_s_d" numeric NOT NULL,
  	"stripe_checkout_session_id" varchar,
  	"stripe_payment_intent_id" varchar,
  	"receipt_email_send_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "order_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_id" integer NOT NULL,
  	"item_type" "enum_order_items_item_type" NOT NULL,
  	"label" varchar,
  	"unit_amount_u_s_d" numeric NOT NULL,
  	"qty" numeric NOT NULL,
  	"total_u_s_d" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "transactions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_id" integer NOT NULL,
  	"amount_u_s_d" numeric NOT NULL,
  	"payment_type" "enum_transactions_payment_type" NOT NULL,
  	"contact_id" integer,
  	"stripe_ref_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "email_templates_placeholders" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "email_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"status" "enum_email_templates_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "email_templates_locales" (
  	"subject" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "email_sends" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"template_id" integer,
  	"source" "enum_email_sends_source" DEFAULT 'template',
  	"template_slug" varchar,
  	"contact_id" integer,
  	"to_email" varchar NOT NULL,
  	"lang" varchar,
  	"status" "enum_email_sends_status" DEFAULT 'queued',
  	"subject" varchar,
  	"provider_message_id" varchar,
  	"error_code" "enum_email_sends_error_code",
  	"sent_at" timestamp(3) with time zone,
  	"error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "donations_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"max_donation_u_s_d" numeric DEFAULT 10000,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_content_columns_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_content_columns_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content_columns_locales" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  ALTER TABLE "pages" ADD COLUMN "content_mode" "enum_pages_content_mode" DEFAULT 'builder';
  ALTER TABLE "pages" ADD COLUMN "meta_no_index" boolean DEFAULT false;
  ALTER TABLE "pages_locales" ADD COLUMN "html" varchar;
  ALTER TABLE "pages_rels" ADD COLUMN "membership_plans_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_content_mode" "enum__pages_v_version_content_mode" DEFAULT 'builder';
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_no_index" boolean DEFAULT false;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_html" varchar;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "membership_plans_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contacts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "campaigns_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "subscription_topics_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "subscriptions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "membership_plans_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "memberships_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "order_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "transactions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_templates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_sends_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "min_page_width" numeric DEFAULT 360;
  ALTER TABLE "site_settings" ADD COLUMN "max_page_width" numeric DEFAULT 1440;
  ALTER TABLE "site_settings" ADD COLUMN "content_max_width" numeric DEFAULT 1040;
  ALTER TABLE "pages_blocks_rich_text_block" ADD CONSTRAINT "pages_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text_block_locales" ADD CONSTRAINT "pages_blocks_rich_text_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_rich_text_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_donation_block_suggested_amounts" ADD CONSTRAINT "pages_blocks_donation_block_suggested_amounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_donation_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_donation_block" ADD CONSTRAINT "pages_blocks_donation_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_donation_block_locales" ADD CONSTRAINT "pages_blocks_donation_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_donation_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_membership_block" ADD CONSTRAINT "pages_blocks_membership_block_default_plan_id_membership_plans_id_fk" FOREIGN KEY ("default_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_membership_block" ADD CONSTRAINT "pages_blocks_membership_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_membership_block_locales" ADD CONSTRAINT "pages_blocks_membership_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_membership_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_subscription_block" ADD CONSTRAINT "pages_blocks_subscription_block_topic_id_subscription_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."subscription_topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_subscription_block" ADD CONSTRAINT "pages_blocks_subscription_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_subscription_block_locales" ADD CONSTRAINT "pages_blocks_subscription_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_subscription_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_container_columns" ADD CONSTRAINT "pages_blocks_container_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_container"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_container" ADD CONSTRAINT "pages_blocks_container_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_container_locales" ADD CONSTRAINT "pages_blocks_container_locales_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_container_locales" ADD CONSTRAINT "pages_blocks_container_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_container"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_texts" ADD CONSTRAINT "pages_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text_block" ADD CONSTRAINT "_pages_v_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text_block_locales" ADD CONSTRAINT "_pages_v_blocks_rich_text_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_rich_text_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_donation_block_suggested_amounts" ADD CONSTRAINT "_pages_v_blocks_donation_block_suggested_amounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_donation_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_donation_block" ADD CONSTRAINT "_pages_v_blocks_donation_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_donation_block_locales" ADD CONSTRAINT "_pages_v_blocks_donation_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_donation_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_membership_block" ADD CONSTRAINT "_pages_v_blocks_membership_block_default_plan_id_membership_plans_id_fk" FOREIGN KEY ("default_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_membership_block" ADD CONSTRAINT "_pages_v_blocks_membership_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_membership_block_locales" ADD CONSTRAINT "_pages_v_blocks_membership_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_membership_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_subscription_block" ADD CONSTRAINT "_pages_v_blocks_subscription_block_topic_id_subscription_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."subscription_topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_subscription_block" ADD CONSTRAINT "_pages_v_blocks_subscription_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_subscription_block_locales" ADD CONSTRAINT "_pages_v_blocks_subscription_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_subscription_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_container_columns" ADD CONSTRAINT "_pages_v_blocks_container_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_container"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_container" ADD CONSTRAINT "_pages_v_blocks_container_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_container_locales" ADD CONSTRAINT "_pages_v_blocks_container_locales_background_media_id_media_id_fk" FOREIGN KEY ("background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_container_locales" ADD CONSTRAINT "_pages_v_blocks_container_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_container"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_texts" ADD CONSTRAINT "_pages_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_topic_id_subscription_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."subscription_topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membership_plans_locales" ADD CONSTRAINT "membership_plans_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."membership_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_plan_id_membership_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_templates_placeholders" ADD CONSTRAINT "email_templates_placeholders_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "email_templates_locales" ADD CONSTRAINT "email_templates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "email_sends" ADD CONSTRAINT "email_sends_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_sends" ADD CONSTRAINT "email_sends_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_rich_text_block_order_idx" ON "pages_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_block_parent_id_idx" ON "pages_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_block_path_idx" ON "pages_blocks_rich_text_block" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_rich_text_block_locales_locale_parent_id_unique" ON "pages_blocks_rich_text_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_donation_block_suggested_amounts_order_idx" ON "pages_blocks_donation_block_suggested_amounts" USING btree ("_order");
  CREATE INDEX "pages_blocks_donation_block_suggested_amounts_parent_id_idx" ON "pages_blocks_donation_block_suggested_amounts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_donation_block_order_idx" ON "pages_blocks_donation_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_donation_block_parent_id_idx" ON "pages_blocks_donation_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_donation_block_path_idx" ON "pages_blocks_donation_block" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_donation_block_locales_locale_parent_id_unique" ON "pages_blocks_donation_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_membership_block_order_idx" ON "pages_blocks_membership_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_membership_block_parent_id_idx" ON "pages_blocks_membership_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_membership_block_path_idx" ON "pages_blocks_membership_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_membership_block_default_plan_idx" ON "pages_blocks_membership_block" USING btree ("default_plan_id");
  CREATE UNIQUE INDEX "pages_blocks_membership_block_locales_locale_parent_id_uniqu" ON "pages_blocks_membership_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_subscription_block_order_idx" ON "pages_blocks_subscription_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_subscription_block_parent_id_idx" ON "pages_blocks_subscription_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_subscription_block_path_idx" ON "pages_blocks_subscription_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_subscription_block_topic_idx" ON "pages_blocks_subscription_block" USING btree ("topic_id");
  CREATE UNIQUE INDEX "pages_blocks_subscription_block_locales_locale_parent_id_uni" ON "pages_blocks_subscription_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_container_columns_order_idx" ON "pages_blocks_container_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_container_columns_parent_id_idx" ON "pages_blocks_container_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_container_order_idx" ON "pages_blocks_container" USING btree ("_order");
  CREATE INDEX "pages_blocks_container_parent_id_idx" ON "pages_blocks_container" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_container_path_idx" ON "pages_blocks_container" USING btree ("_path");
  CREATE INDEX "pages_blocks_container_background_media_idx" ON "pages_blocks_container_locales" USING btree ("background_media_id","_locale");
  CREATE UNIQUE INDEX "pages_blocks_container_locales_locale_parent_id_unique" ON "pages_blocks_container_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_texts_order_parent" ON "pages_texts" USING btree ("order","parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_block_order_idx" ON "_pages_v_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_block_parent_id_idx" ON "_pages_v_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_block_path_idx" ON "_pages_v_blocks_rich_text_block" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_rich_text_block_locales_locale_parent_id_uni" ON "_pages_v_blocks_rich_text_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_donation_block_suggested_amounts_order_idx" ON "_pages_v_blocks_donation_block_suggested_amounts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_donation_block_suggested_amounts_parent_id_idx" ON "_pages_v_blocks_donation_block_suggested_amounts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_donation_block_order_idx" ON "_pages_v_blocks_donation_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_donation_block_parent_id_idx" ON "_pages_v_blocks_donation_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_donation_block_path_idx" ON "_pages_v_blocks_donation_block" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_donation_block_locales_locale_parent_id_uniq" ON "_pages_v_blocks_donation_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_membership_block_order_idx" ON "_pages_v_blocks_membership_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_membership_block_parent_id_idx" ON "_pages_v_blocks_membership_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_membership_block_path_idx" ON "_pages_v_blocks_membership_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_membership_block_default_plan_idx" ON "_pages_v_blocks_membership_block" USING btree ("default_plan_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_membership_block_locales_locale_parent_id_un" ON "_pages_v_blocks_membership_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_subscription_block_order_idx" ON "_pages_v_blocks_subscription_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_subscription_block_parent_id_idx" ON "_pages_v_blocks_subscription_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_subscription_block_path_idx" ON "_pages_v_blocks_subscription_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_subscription_block_topic_idx" ON "_pages_v_blocks_subscription_block" USING btree ("topic_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_subscription_block_locales_locale_parent_id_" ON "_pages_v_blocks_subscription_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_container_columns_order_idx" ON "_pages_v_blocks_container_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_container_columns_parent_id_idx" ON "_pages_v_blocks_container_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_container_order_idx" ON "_pages_v_blocks_container" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_container_parent_id_idx" ON "_pages_v_blocks_container" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_container_path_idx" ON "_pages_v_blocks_container" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_container_background_media_idx" ON "_pages_v_blocks_container_locales" USING btree ("background_media_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_blocks_container_locales_locale_parent_id_unique" ON "_pages_v_blocks_container_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_texts_order_parent" ON "_pages_v_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");
  CREATE INDEX "contacts_campaign_idx" ON "contacts" USING btree ("campaign_id");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  CREATE UNIQUE INDEX "campaigns_name_idx" ON "campaigns" USING btree ("name");
  CREATE UNIQUE INDEX "campaigns_reftag_idx" ON "campaigns" USING btree ("reftag");
  CREATE INDEX "campaigns_updated_at_idx" ON "campaigns" USING btree ("updated_at");
  CREATE INDEX "campaigns_created_at_idx" ON "campaigns" USING btree ("created_at");
  CREATE UNIQUE INDEX "subscription_topics_slug_idx" ON "subscription_topics" USING btree ("slug");
  CREATE UNIQUE INDEX "subscription_topics_name_idx" ON "subscription_topics" USING btree ("name");
  CREATE INDEX "subscription_topics_updated_at_idx" ON "subscription_topics" USING btree ("updated_at");
  CREATE INDEX "subscription_topics_created_at_idx" ON "subscription_topics" USING btree ("created_at");
  CREATE UNIQUE INDEX "subscriptions_key_idx" ON "subscriptions" USING btree ("key");
  CREATE INDEX "subscriptions_contact_idx" ON "subscriptions" USING btree ("contact_id");
  CREATE INDEX "subscriptions_topic_idx" ON "subscriptions" USING btree ("topic_id");
  CREATE INDEX "subscriptions_campaign_idx" ON "subscriptions" USING btree ("campaign_id");
  CREATE INDEX "subscriptions_updated_at_idx" ON "subscriptions" USING btree ("updated_at");
  CREATE INDEX "subscriptions_created_at_idx" ON "subscriptions" USING btree ("created_at");
  CREATE UNIQUE INDEX "membership_plans_slug_idx" ON "membership_plans" USING btree ("slug");
  CREATE INDEX "membership_plans_updated_at_idx" ON "membership_plans" USING btree ("updated_at");
  CREATE INDEX "membership_plans_created_at_idx" ON "membership_plans" USING btree ("created_at");
  CREATE UNIQUE INDEX "membership_plans_locales_locale_parent_id_unique" ON "membership_plans_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "memberships_contact_idx" ON "memberships" USING btree ("contact_id");
  CREATE INDEX "memberships_plan_idx" ON "memberships" USING btree ("plan_id");
  CREATE INDEX "memberships_campaign_idx" ON "memberships" USING btree ("campaign_id");
  CREATE INDEX "memberships_updated_at_idx" ON "memberships" USING btree ("updated_at");
  CREATE INDEX "memberships_created_at_idx" ON "memberships" USING btree ("created_at");
  CREATE UNIQUE INDEX "orders_public_id_idx" ON "orders" USING btree ("public_id");
  CREATE INDEX "orders_contact_idx" ON "orders" USING btree ("contact_id");
  CREATE INDEX "orders_campaign_idx" ON "orders" USING btree ("campaign_id");
  CREATE INDEX "orders_stripe_checkout_session_id_idx" ON "orders" USING btree ("stripe_checkout_session_id");
  CREATE INDEX "orders_stripe_payment_intent_id_idx" ON "orders" USING btree ("stripe_payment_intent_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");
  CREATE INDEX "order_items_updated_at_idx" ON "order_items" USING btree ("updated_at");
  CREATE INDEX "order_items_created_at_idx" ON "order_items" USING btree ("created_at");
  CREATE INDEX "transactions_order_idx" ON "transactions" USING btree ("order_id");
  CREATE INDEX "transactions_contact_idx" ON "transactions" USING btree ("contact_id");
  CREATE INDEX "transactions_updated_at_idx" ON "transactions" USING btree ("updated_at");
  CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");
  CREATE INDEX "email_templates_placeholders_order_idx" ON "email_templates_placeholders" USING btree ("_order");
  CREATE INDEX "email_templates_placeholders_parent_id_idx" ON "email_templates_placeholders" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "email_templates_slug_idx" ON "email_templates" USING btree ("slug");
  CREATE INDEX "email_templates_updated_at_idx" ON "email_templates" USING btree ("updated_at");
  CREATE INDEX "email_templates_created_at_idx" ON "email_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "email_templates_locales_locale_parent_id_unique" ON "email_templates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "email_sends_template_idx" ON "email_sends" USING btree ("template_id");
  CREATE INDEX "email_sends_contact_idx" ON "email_sends" USING btree ("contact_id");
  CREATE INDEX "email_sends_updated_at_idx" ON "email_sends" USING btree ("updated_at");
  CREATE INDEX "email_sends_created_at_idx" ON "email_sends" USING btree ("created_at");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_membership_plans_fk" FOREIGN KEY ("membership_plans_id") REFERENCES "public"."membership_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_membership_plans_fk" FOREIGN KEY ("membership_plans_id") REFERENCES "public"."membership_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_campaigns_fk" FOREIGN KEY ("campaigns_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscription_topics_fk" FOREIGN KEY ("subscription_topics_id") REFERENCES "public"."subscription_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscriptions_fk" FOREIGN KEY ("subscriptions_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_membership_plans_fk" FOREIGN KEY ("membership_plans_id") REFERENCES "public"."membership_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_memberships_fk" FOREIGN KEY ("memberships_id") REFERENCES "public"."memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_order_items_fk" FOREIGN KEY ("order_items_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_transactions_fk" FOREIGN KEY ("transactions_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_templates_fk" FOREIGN KEY ("email_templates_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_sends_fk" FOREIGN KEY ("email_sends_id") REFERENCES "public"."email_sends"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_membership_plans_id_idx" ON "pages_rels" USING btree ("membership_plans_id");
  CREATE INDEX "_pages_v_rels_membership_plans_id_idx" ON "_pages_v_rels" USING btree ("membership_plans_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_locked_documents_rels_campaigns_id_idx" ON "payload_locked_documents_rels" USING btree ("campaigns_id");
  CREATE INDEX "payload_locked_documents_rels_subscription_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("subscription_topics_id");
  CREATE INDEX "payload_locked_documents_rels_subscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("subscriptions_id");
  CREATE INDEX "payload_locked_documents_rels_membership_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("membership_plans_id");
  CREATE INDEX "payload_locked_documents_rels_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("memberships_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_order_items_id_idx" ON "payload_locked_documents_rels" USING btree ("order_items_id");
  CREATE INDEX "payload_locked_documents_rels_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("transactions_id");
  CREATE INDEX "payload_locked_documents_rels_email_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("email_templates_id");
  CREATE INDEX "payload_locked_documents_rels_email_sends_id_idx" ON "payload_locked_documents_rels" USING btree ("email_sends_id");
  ALTER TABLE "media" DROP COLUMN "prefix";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content_columns_locales" (
  	"rich_text" jsonb,
  	"link_url" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns_locales" (
  	"rich_text" jsonb,
  	"link_url" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_donation_block_suggested_amounts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_donation_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_donation_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_membership_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_membership_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_subscription_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_subscription_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_container_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_container" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_container_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_donation_block_suggested_amounts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_donation_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_donation_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_membership_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_membership_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_subscription_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_subscription_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_container_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_container" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_container_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campaigns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "subscription_topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "subscriptions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "membership_plans_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "memberships" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "order_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "transactions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_templates_placeholders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_templates_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_sends" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "donations_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_rich_text_block" CASCADE;
  DROP TABLE "pages_blocks_rich_text_block_locales" CASCADE;
  DROP TABLE "pages_blocks_donation_block_suggested_amounts" CASCADE;
  DROP TABLE "pages_blocks_donation_block" CASCADE;
  DROP TABLE "pages_blocks_donation_block_locales" CASCADE;
  DROP TABLE "pages_blocks_membership_block" CASCADE;
  DROP TABLE "pages_blocks_membership_block_locales" CASCADE;
  DROP TABLE "pages_blocks_subscription_block" CASCADE;
  DROP TABLE "pages_blocks_subscription_block_locales" CASCADE;
  DROP TABLE "pages_blocks_container_columns" CASCADE;
  DROP TABLE "pages_blocks_container" CASCADE;
  DROP TABLE "pages_blocks_container_locales" CASCADE;
  DROP TABLE "pages_texts" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text_block" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text_block_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_donation_block_suggested_amounts" CASCADE;
  DROP TABLE "_pages_v_blocks_donation_block" CASCADE;
  DROP TABLE "_pages_v_blocks_donation_block_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_membership_block" CASCADE;
  DROP TABLE "_pages_v_blocks_membership_block_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_subscription_block" CASCADE;
  DROP TABLE "_pages_v_blocks_subscription_block_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_container_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_container" CASCADE;
  DROP TABLE "_pages_v_blocks_container_locales" CASCADE;
  DROP TABLE "_pages_v_texts" CASCADE;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "campaigns" CASCADE;
  DROP TABLE "subscription_topics" CASCADE;
  DROP TABLE "subscriptions" CASCADE;
  DROP TABLE "membership_plans" CASCADE;
  DROP TABLE "membership_plans_locales" CASCADE;
  DROP TABLE "memberships" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "order_items" CASCADE;
  DROP TABLE "transactions" CASCADE;
  DROP TABLE "email_templates_placeholders" CASCADE;
  DROP TABLE "email_templates" CASCADE;
  DROP TABLE "email_templates_locales" CASCADE;
  DROP TABLE "email_sends" CASCADE;
  DROP TABLE "donations_settings" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_membership_plans_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_membership_plans_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contacts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_campaigns_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_subscription_topics_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_subscriptions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_membership_plans_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_memberships_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_order_items_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_transactions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_templates_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_sends_fk";
  
  DROP INDEX "pages_rels_membership_plans_id_idx";
  DROP INDEX "_pages_v_rels_membership_plans_id_idx";
  DROP INDEX "payload_locked_documents_rels_contacts_id_idx";
  DROP INDEX "payload_locked_documents_rels_campaigns_id_idx";
  DROP INDEX "payload_locked_documents_rels_subscription_topics_id_idx";
  DROP INDEX "payload_locked_documents_rels_subscriptions_id_idx";
  DROP INDEX "payload_locked_documents_rels_membership_plans_id_idx";
  DROP INDEX "payload_locked_documents_rels_memberships_id_idx";
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_order_items_id_idx";
  DROP INDEX "payload_locked_documents_rels_transactions_id_idx";
  DROP INDEX "payload_locked_documents_rels_email_templates_id_idx";
  DROP INDEX "payload_locked_documents_rels_email_sends_id_idx";
  ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT 'local/media';
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns_locales" ADD CONSTRAINT "pages_blocks_content_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns_locales" ADD CONSTRAINT "_pages_v_blocks_content_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_content_columns_locales_locale_parent_id_unique" ON "pages_blocks_content_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_content_columns_locales_locale_parent_id_uni" ON "_pages_v_blocks_content_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  ALTER TABLE "pages" DROP COLUMN "content_mode";
  ALTER TABLE "pages" DROP COLUMN "meta_no_index";
  ALTER TABLE "pages_locales" DROP COLUMN "html";
  ALTER TABLE "pages_rels" DROP COLUMN "membership_plans_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_content_mode";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_no_index";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_html";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "membership_plans_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contacts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "campaigns_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "subscription_topics_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "subscriptions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "membership_plans_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "memberships_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "order_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "transactions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_templates_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_sends_id";
  ALTER TABLE "site_settings" DROP COLUMN "min_page_width";
  ALTER TABLE "site_settings" DROP COLUMN "max_page_width";
  ALTER TABLE "site_settings" DROP COLUMN "content_max_width";
  DROP TYPE "public"."enum_pages_blocks_container_columns_size";
  DROP TYPE "public"."enum_pages_blocks_container_width_mode";
  DROP TYPE "public"."enum_pages_blocks_container_background_variant";
  DROP TYPE "public"."enum_pages_blocks_container_background_fit";
  DROP TYPE "public"."enum_pages_blocks_container_outer_spacing_y";
  DROP TYPE "public"."enum_pages_blocks_container_inner_padding";
  DROP TYPE "public"."enum_pages_content_mode";
  DROP TYPE "public"."enum__pages_v_blocks_container_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_container_width_mode";
  DROP TYPE "public"."enum__pages_v_blocks_container_background_variant";
  DROP TYPE "public"."enum__pages_v_blocks_container_background_fit";
  DROP TYPE "public"."enum__pages_v_blocks_container_outer_spacing_y";
  DROP TYPE "public"."enum__pages_v_blocks_container_inner_padding";
  DROP TYPE "public"."enum__pages_v_version_content_mode";
  DROP TYPE "public"."enum_contacts_language";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_order_items_item_type";
  DROP TYPE "public"."enum_transactions_payment_type";
  DROP TYPE "public"."enum_email_templates_status";
  DROP TYPE "public"."enum_email_sends_source";
  DROP TYPE "public"."enum_email_sends_status";
  DROP TYPE "public"."enum_email_sends_error_code";`)
}
