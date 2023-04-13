import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.182.0/testing/mock.ts";
import { test } from "https://deno.land/x/denops_test@v1.1.0/mod.ts";
import type { Item } from "https://deno.land/x/ddu_vim@v2.7.0/types.ts";
import type { Denops } from "https://deno.land/x/ddu_vim@v2.7.0/deps.ts";
import { defaultDduOptions } from "https://deno.land/x/ddu_vim@v2.7.0/context.ts";
import { Source } from "../denops/@ddu-sources/plugin_dein.ts";

function denopsStub(denops: Denops) {
  stub(denops, "call", async (name: string, ...args: unknown[]) => {
    if (name === "dein#get") {
      return {
        dein: { name: "dein", path: "/path/to/dein" },
        denops: { name: "denops", path: "/path/to/denops" },
      };
    }
    if (name.startsWith("dein#update")) {
      return;
    }
    return await denops.call(name, ...args);
  });
}

Deno.test("any", () => {})

test("any", "ensure the connection with denops", (denops) => {
  assertEquals(denops.name, "@denops-test");
});

test("any", "constructor", () => {
  const source = new Source();
  assertEquals(source.kind, "file");
  assertEquals(source.params().update, []);
});

test("any", "gather", async (denops) => {
  denopsStub(denops);
  const source = new Source();
  const stream = source.gather({
    denops,
    options: defaultDduOptions(),
    sourceParams: source.params(),
  });
  assertEquals(
    await readAll(stream),
    [
      {
        word: "dein",
        action: {
          status: "idle",
          path: "/path/to/dein",
        },
      },
      {
        word: "denops",
        action: {
          status: "idle",
          path: "/path/to/denops",
        },
      },
    ],
  );
});

test("any", "update a single item", async (denops) => {
  denopsStub(denops);
  const source = new Source();
  await source.actions.update({
    denops,
    // @ts-ignore hard to mock DduItem[]
    items: [{ word: "dein" }],
  });
  const stream = source.gather({
    denops,
    options: defaultDduOptions(),
    sourceParams: source.params(),
  });
  assertEquals(
    await readAll(stream),
    [
      {
        word: "dein",
        action: {
          status: "updating",
          path: "/path/to/dein",
        },
      },
      {
        word: "denops",
        action: {
          status: "idle",
          path: "/path/to/denops",
        },
      },
    ],
  );
});

async function readAll(stream: ReadableStream<Item[]>): Promise<Item[]> {
  const items: Item[] = [];
  for await (const chunk of stream) {
    items.push(...chunk);
  }
  return items;
}
