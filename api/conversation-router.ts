import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { conversations, messages } from "@db/schema";
import { and, eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

async function assertConversationAccess(
  conversationId: number,
  userId: number
) {
  const db = getDb();
  const rows = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  const conversation = rows.at(0);

  if (!conversation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Conversation not found.",
    });
  }

  const ownedRows = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId)
      )
    )
    .limit(1);
  const ownsConversation = ownedRows.length > 0;

  if (!ownsConversation) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this conversation.",
    });
  }

  return db;
}

export const conversationRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, ctx.user.id))
      .orderBy(desc(conversations.updatedAt));
  }),

  create: authedQuery
    .input(z.object({ title: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [conv] = await db
        .insert(conversations)
        .values({
          userId: ctx.user.id,
          title: input.title,
        })
        .$returningId();
      return { id: conv.id };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await assertConversationAccess(input.id, ctx.user.id);
      await db.delete(conversations).where(eq(conversations.id, input.id));
      return { success: true };
    }),

  messages: authedQuery
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await assertConversationAccess(input.conversationId, ctx.user.id);
      return db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(messages.createdAt);
    }),

  addMessage: authedQuery
    .input(
      z.object({
        conversationId: z.number(),
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        metadata: z
          .object({
            codeBlocks: z
              .array(
                z.object({
                  language: z.string(),
                  code: z.string(),
                })
              )
              .optional(),
            pinMapping: z
              .array(
                z.object({
                  pin: z.string(),
                  function: z.string(),
                  direction: z.string(),
                })
              )
              .optional(),
            references: z
              .array(
                z.object({
                  title: z.string(),
                  url: z.string(),
                })
              )
              .optional(),
            debugChecklist: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await assertConversationAccess(input.conversationId, ctx.user.id);
      const [msg] = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          role: input.role,
          content: input.content,
          metadata: input.metadata,
        })
        .$returningId();
      return { id: msg.id };
    }),
});
