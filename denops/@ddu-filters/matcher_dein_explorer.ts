import {
  BaseFilter,
  BaseFilterParams,
  DduItem,
} from "https://deno.land/x/ddu_vim@v2.7.0/types.ts";
import { Plugin } from "../@ddu_dein_explorer/types.ts";

interface Params extends BaseFilterParams {
  hasUpdate?: boolean;
}

export class Filter extends BaseFilter<Params> {
  // deno-lint-ignore require-await
  async filter(args: {
    filterParams: Params;
    input: string;
    items: DduItem[];
  }): Promise<Plugin[]> {
    return args.items;
  }

  params() {
    return {
      hasUpdate: undefined,
    };
  }
}
