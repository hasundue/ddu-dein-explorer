import { Backend, type Plugin } from "../../@ddu-sources/plugin.ts";

type Dict = {
  name: string;
  path: string;
};

export class Dein extends Backend {
  name = "dein";

  async get(name: string): Promise<Plugin> {
    return await this.denops.call("dein#get", name) as Dict;
  }

  async list(): Promise<string[]> {
    const dicts = await this.denops.call("dein#get") as Record<string, Dict>;
    return Object.keys(dicts);
  }
}
