import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@db/schema";

const mockState = vi.hoisted(() => ({
  selectResults: [] as unknown[][],
  insertValues: [] as unknown[],
}));

vi.mock("./queries/connection", () => {
  const db = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi
            .fn()
            .mockImplementation(async () => mockState.selectResults.shift() ?? []),
          orderBy: vi
            .fn()
            .mockImplementation(async () => mockState.selectResults.shift() ?? []),
        })),
        orderBy: vi
          .fn()
          .mockImplementation(async () => mockState.selectResults.shift() ?? []),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn((value: unknown) => {
        mockState.insertValues.push(value);
        return {
          $returningId: vi.fn(async () => [{ id: 99 }]),
        };
      }),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(async () => ({ success: true })),
    })),
  };

  return {
    getDb: () => db,
  };
});

import { conversationRouter } from "./conversation-router";

function createCaller(user?: User) {
  return conversationRouter.createCaller({
    req: new Request("http://localhost/api/trpc"),
    resHeaders: new Headers(),
    user,
  });
}

function createUser(id: number, role: "user" | "admin"): User {
  return {
    id,
    unionId: `user-${id}`,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    avatar: null,
    role,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    lastSignInAt: new Date(0),
  };
}

describe("conversation router access control", () => {
  beforeEach(() => {
    mockState.selectResults = [];
    mockState.insertValues = [];
  });

  it("requires authentication before loading conversation messages", async () => {
    const caller = createCaller();

    await expect(caller.messages({ conversationId: 42 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("blocks access to another user's conversation messages", async () => {
    mockState.selectResults = [[{ id: 42 }], []];
    const caller = createCaller(createUser(7, "user"));

    await expect(caller.messages({ conversationId: 42 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("blocks writes to another user's conversation", async () => {
    mockState.selectResults = [[{ id: 42 }], []];
    const caller = createCaller(createUser(7, "user"));

    await expect(
      caller.addMessage({
        conversationId: 42,
        role: "user",
        content: "hello",
      })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(mockState.insertValues).toHaveLength(0);
  });

  it("returns messages for the owning user", async () => {
    mockState.selectResults = [
      [{ id: 42 }],
      [{ id: 42 }],
      [{ id: 1, conversationId: 42, role: "assistant", content: "ok" }],
    ];
    const caller = createCaller(createUser(42, "admin"));

    const result = await caller.messages({ conversationId: 42 });

    expect(result).toEqual([
      expect.objectContaining({
        conversationId: 42,
        content: "ok",
      }),
    ]);
  });
});
