import {
  ActionFlags,
  BaseSource,
  DduOptions,
  Item,
} from "https://deno.land/x/ddu_vim@v2.7.0/types.ts";
import { Denops } from "https://deno.land/x/ddu_vim@v2.7.0/deps.ts";
import {
  ActionData as FileActionData,
  Kind as File,
} from "https://deno.land/x/ddu_kind_file@v0.3.2/file.ts";

export type Params = ReturnType<File["params"]> & {
  update: string[]; // name of the plugin to update
};

export type ActionData = FileActionData & {
  status: "idle" | "updating";
};

type Dein = {
  name: string;
  path: string;
};

export class Source extends BaseSource<Params> {
  // We do not define new kind for the sake of backward compatibility
  override kind = "file";
  override params: () => Params;

  private _file: File;
  private _items?: Item<ActionData>[]; // dictonaries of all the plugins installed
  private _updating = new Set<string>();

  constructor() {
    super();
    this._file = new File();
    this.actions = {
      ...this._file.actions,

      update: async ({ denops, items }) => {
        const names = items.map((it) => it.word);
        denops.call("dein#update", names);
        this._updating.push(...names);
        return ActionFlags.RefreshItems;
      },
    };
    this.params = () => {
      return {
        ...this._file.params(),
        update: this._updating,
      };
    };
  }

  override gather(args: {
    denops: Denops;
    options: DduOptions;
    sourceParams: Params;
  }): ReadableStream<Item<ActionData>[]> {
    const source = this;
    source._updating.add(...args.sourceParams.update);

    return new ReadableStream({
      async start(controller) {
        if (!source._items) {
          const deins = Object.values(
            await args.denops.call("dein#get") as Record<string, Dein>,
          );
          source._items = deins.map((dein) => ({
            word: dein.name,
            action: {
              status: "idle",
              path: dein.path,
            },
          }));
        }
        controller.enqueue(source._items);
        controller.close();
      },
    });
  }
}
