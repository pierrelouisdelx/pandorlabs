CREATE TABLE "inbound_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_message_id" text NOT NULL,
	"from_address" text NOT NULL,
	"from_name" text,
	"to_address" text NOT NULL,
	"subject" text,
	"text" text,
	"html" text,
	"status" text DEFAULT 'unread' NOT NULL,
	"received_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inbound_emails_provider_message_id_unique" UNIQUE("provider_message_id")
);
--> statement-breakpoint
CREATE INDEX "idx_inbound_emails_created_at" ON "inbound_emails" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_inbound_emails_status" ON "inbound_emails" USING btree ("status");