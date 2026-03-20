import { pgTable, text, serial, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ticketStatusEnum = pgEnum("ticket_status", ["cargado", "en_revision", "finalizado"]);
export const problemTypeEnum = pgEnum("problem_type", ["hardware", "software"]);

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  clientName: text("client_name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  problemType: problemTypeEnum("problem_type").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default("cargado"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  ticketId: serial("ticket_id").notNull().references(() => ticketsTable.id),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, ticketNumber: true, createdAt: true, updatedAt: true });
export const insertCommentSchema = createInsertSchema(commentsTable).omit({ id: true, createdAt: true });

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof commentsTable.$inferSelect;
