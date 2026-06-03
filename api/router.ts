import { authRouter } from "./auth-router";
import { conversationRouter } from "./conversation-router";
import { componentRouter } from "./component-router";
import { chatRouter } from "./chat-router";
import { aiRouter } from "./ai-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  conversation: conversationRouter,
  component: componentRouter,
  ai: aiRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
