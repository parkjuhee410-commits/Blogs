CREATE TYPE "public"."category" AS ENUM('food', 'ai_tech', 'real_estate');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('insight', 'faq', 'glossary', 'daily');--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" varchar(300) NOT NULL,
	"content" text NOT NULL,
	"cover_image_url" varchar(500),
	"type" "post_type" DEFAULT 'insight' NOT NULL,
	"category" "category" DEFAULT 'ai_tech' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
