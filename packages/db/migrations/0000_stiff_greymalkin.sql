CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "idx_waitlist_email" ON "waitlist" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_waitlist_created_at" ON "waitlist" USING btree ("created_at" DESC NULLS LAST);