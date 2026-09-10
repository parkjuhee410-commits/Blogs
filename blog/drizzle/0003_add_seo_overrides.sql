ALTER TABLE "posts" ADD COLUMN "meta_title" varchar(200);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "meta_description" varchar(300);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "noindex" boolean DEFAULT false NOT NULL;