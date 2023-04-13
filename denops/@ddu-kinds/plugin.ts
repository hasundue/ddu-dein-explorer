import {
  ActionFlags,
  Actions,
  BaseKind,
} from "https://deno.land/x/ddu_vim@v2.7.0/types.ts";

export type ActionData = {
  /**
   * Start updating the plugin.
   * The caller must request the refresh of the items
   * to see the progress.
   */
  update: () => Promise<void>;
};

type Params = {};

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    update: async ({ items, sourceParams }) => {
      for (const item of items) {
        const actions = item.action as ActionData;
        actions.update();
      }
      return ActionFlags.RefreshItems;
    },
  };
  params() {
    return {};
  }
}
