import yaml from "js-yaml";
import { cloneDeep } from "lodash-es";
import { createInterface } from "readline/promises";
import { readFileToJSON, writeJSONToFile } from "./src/utils";
import type { ClashProxy, SingboxConfig } from "./src/types";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const subUrl = await rl.question("Input your subscription:\n");
rl.close();

const sub = await (await fetch(subUrl)).text();
const doc = yaml.load(sub) as { proxies: ClashProxy[] };

const base_config = await readFileToJSON<SingboxConfig>(
  "base_configs/base_config.json"
);
const tun = await readFileToJSON("base_configs/tun.json");
const proxy_names: string[] = [];
const outbounds = doc.proxies.map((it) => {
  proxy_names.push(it.name);
  return {
    type: it.type === "ss" ? "shadowsocks" : it.type,
    server: it.server,
    server_port: Number(it.port),
    method: it.cipher,
    password: it.password,
    plugin: it.plugin?.includes("obfs") ? "obfs-local" : undefined,
    plugin_opts:
      it.plugin && it.plugin.includes("obfs")
        ? `obfs=${it["plugin-opts"]?.mode};obfs-host=${it["plugin-opts"]?.host}`
        : undefined,
    tag: it.name,
  };
});

for (const i of base_config.route.rule_set) {
  i.download_detour = proxy_names[3];
}
const pc_config = cloneDeep(base_config);
pc_config.outbounds = [...base_config.outbounds].concat(outbounds);
let select = pc_config.outbounds.find(
  (it: { tag: string }) => it.tag === "proxy"
);
if (select) {
  select.outbounds = [...proxy_names];
  select.default = proxy_names[20];
}

const mobile_config = cloneDeep(pc_config);
mobile_config.inbounds = [tun];
select = mobile_config.outbounds.find(
  (it: { tag: string }) => it.tag === "proxy"
);
select && delete select.default;

writeJSONToFile("output/pc_config.json", pc_config);
writeJSONToFile("output/mobile_config.json", mobile_config);
