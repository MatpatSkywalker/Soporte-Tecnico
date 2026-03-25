import { Router, type IRouter } from "express";
import { db, ticketsTable, commentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateTicketBody,
  UpdateTicketStatusBody,
  AddCommentBody,
  ListTicketsQueryParams,
} from "@workspace/api-zod";
import {
  sendTicketCreatedToAdmin,
  sendTicketCreatedToClient,
  sendCommentToClient,
} from "../lib/email";

const router: IRouter = Router();

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

router.get("/tickets", async (req, res) => {
  try {
    const query = ListTicketsQueryParams.parse(req.query);
    let tickets;
    if (query.status) {
      tickets = await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.status, query.status))
        .orderBy(desc(ticketsTable.createdAt));
    } else {
      tickets = await db
        .select()
        .from(ticketsTable)
        .orderBy(desc(ticketsTable.createdAt));
    }
    res.json(tickets);
  } catch (err) {
    req.log.error({ err }, "Failed to list tickets");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/tickets", async (req, res) => {
  try {
    const body = CreateTicketBody.parse(req.body);
    const ticketNumber = generateTicketNumber();

    const [ticket] = await db
      .insert(ticketsTable)
      .values({
        ticketNumber,
        clientName: body.clientName,
        company: body.company,
        email: body.email,
        phone: body.phone,
        problemType: body.problemType,
        description: body.description,
        status: "cargado",
      })
      .returning();

    await Promise.all([
      sendTicketCreatedToClient({
        clientName: ticket.clientName,
        clientEmail: ticket.email,
        ticketNumber: ticket.ticketNumber,
        problemType: ticket.problemType,
        description: ticket.description,
      }),
      sendTicketCreatedToAdmin({
        clientName: ticket.clientName,
        company: ticket.company,
        clientEmail: ticket.email,
        phone: ticket.phone,
        ticketNumber: ticket.ticketNumber,
        problemType: ticket.problemType,
        description: ticket.description,
      }),
    ]);

    res.status(201).json(ticket);
  } catch (err: any) {
    req.log.error({ err }, "Failed to create ticket");
    if (err?.name === "ZodError") {
      res.status(400).json({ error: "Datos inválidos" });
      return;
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/tickets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }
    const [ticket] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, id));

    if (!ticket) {
      res.status(404).json({ error: "Ticket no encontrado" });
      return;
    }

    const comments = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.ticketId, id))
      .orderBy(commentsTable.createdAt);

    res.json({ ...ticket, comments });
  } catch (err) {
    req.log.error({ err }, "Failed to get ticket");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.patch("/tickets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const body = UpdateTicketStatusBody.parse(req.body);

    const [ticket] = await db
      .update(ticketsTable)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(ticketsTable.id, id))
      .returning();

    if (!ticket) {
      res.status(404).json({ error: "Ticket no encontrado" });
      return;
    }

    res.json(ticket);
  } catch (err: any) {
    req.log.error({ err }, "Failed to update ticket");
    if (err?.name === "ZodError") {
      res.status(400).json({ error: "Datos inválidos" });
      return;
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/tickets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    await db.delete(commentsTable).where(eq(commentsTable.ticketId, id));

    const [deleted] = await db
      .delete(ticketsTable)
      .where(eq(ticketsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Ticket no encontrado" });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete ticket");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/tickets/:id/comments", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const [ticket] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, id));

    if (!ticket) {
      res.status(404).json({ error: "Ticket no encontrado" });
      return;
    }

    const body = AddCommentBody.parse(req.body);

    const [comment] = await db
      .insert(commentsTable)
      .values({
        ticketId: id,
        content: body.content,
        isInternal: body.isInternal,
      })
      .returning();

    if (!body.isInternal) {
      await sendCommentToClient({
        clientName: ticket.clientName,
        clientEmail: ticket.email,
        ticketNumber: ticket.ticketNumber,
        commentContent: body.content,
      });
    }

    res.status(201).json(comment);
  } catch (err: any) {
    req.log.error({ err }, "Failed to add comment");
    if (err?.name === "ZodError") {
      res.status(400).json({ error: "Datos inválidos" });
      return;
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
