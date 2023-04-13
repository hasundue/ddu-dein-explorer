import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v2.7.0/types.ts";
import { Denops } from "https://deno.land/x/ddu_vim@v2.7.0/deps.ts";
import { Dein } from "../@ddu-plugin-manager/backends/dein.ts";

type Params = {
  backend: "pack" | "dein" | "jetpack";
};

export type Plugin = {
  name: string;
};

export abstract class Backend {
  constructor(protected denops: Denops) {
    this.denops = denops;
  }
  abstract list(): Promise<string[]>;
  abstract get(name: string): Promise<Plugin>;
}

export class Source extends BaseSource<Params> {
  override kind = "plugin";

  private backend?: Backend;

  override async onInit(args: {
    denops: Denops;
    sourceParams: Params;
  }) {
    this.backend = await getBackend(args);
  }

  override gather(args: {
    denops: Denops;
    sourceParams: Params;
  }): ReadableStream<Item[]> {
    const backend = this.backend;
    if (!backend) {
      throw new Error("backend is not initialized");
    }
    return new ReadableStream({
      async start(controller) {
        const names = await backend.list();
        const items = names.map((it) => ({ word: it }));
        controller.enqueue(items);
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      backend: "pack",
    };
  }
}

async function getBackend(args: {
  denops: Denops;
  sourceParams: Params;
}): Promise<Backend> {
  switch (args.sourceParams.backend) {
    // case "pack":
    //   return new Pack(args.denops);
    case "dein":
      return new Dein(args.denops);
    // case "jetpack":
    //   return new Jetpack(args.denops);
    default:
      throw new Error(`Unknown backend: ${args.sourceParams.backend}`);
  }
}
