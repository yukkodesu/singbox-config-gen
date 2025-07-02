import yaml from "js-yaml";
import { cloneDeep } from "es-toolkit";
import { readFileToJSON, safeMkdir, writeJSONToFile } from "./src/utils.js";
import { shadowsocksHandler } from "./src/handler/shadowsocks.js";
import { outboundNamingMap } from "./src/outbound_map.js";
import { vlessHandler } from "./src/handler/vless.js";
import { trojanHandler } from "./src/handler/trojan.js";
const args = process.argv.slice(2);

const subIndex = args.indexOf("--clash-sub");
const subUrl = subIndex !== -1 ? args[subIndex + 1] : null;
if (!subUrl) throw new Error("No subscription url");

const sub = await (
  await fetch(subUrl, {
    headers: {
      "User-Agent": "clash-verge/v2.3.1",
    },
  })
).text();
const clashSub = yaml.load(sub);

const base_config = readFileToJSON("base_configs/base_config.json");
const tun = readFileToJSON("base_configs/tun.json");

const clashProxies = clashSub.proxies.map((item) => [item.name, item]);

const handlers = {
  ss: shadowsocksHandler,
  vless: vlessHandler,
  trojan: trojanHandler,
};

const singProxies = [];

const proxySelector = base_config.outbounds.find(
  (item) => item.tag === "proxy"
);
for (const [_, item] of clashProxies) {
  const type = item.type;
  const handler = handlers[type];
  if (!handler) {
    console.warn(`unsupport outbound ${type}`);
    continue;
  }
  const convertedOutbound = handler(item);
  singProxies.push(convertedOutbound);
  proxySelector.outbounds.push(convertedOutbound.tag);
}
base_config.outbounds.push(...singProxies);

const outboundNamingMapEntries = Object.entries(outboundNamingMap);

const outboundSelector = new Map();
outboundNamingMapEntries.forEach(([key, _]) => {
  const outbound = base_config.outbounds.find((item) => item.tag === key);
  outboundSelector.set(key, outbound);
});

const others = base_config.outbounds.find((item) => item.tag === "Others");
outboundSelector.set("Others", others);

// outbound split
for (const item of singProxies) {
  let isMatch = false;
  outboundNamingMapEntries.forEach(([key, reg]) => {
    if (reg.test(item.tag)) {
      isMatch = true;
      outboundSelector.get(key).outbounds.push(item.tag);
    }
  });
  if (!isMatch) {
    others.outbounds.push(item.tag);
  }
}

// this is for robustness. sing-box doesn't support empty outbounds
outboundSelector.values().forEach((item) => {
  if (item.outbounds.length === 0) {
    item.outbounds.push("direct");
  }
});
if (others.outbounds.length === 0) {
  item.push("direct");
}

const pcInbound = base_config.inbounds.find((item) => item.tag === "mixed-in");
pcInbound["set_system_proxy"] = true;
const mobile_config = cloneDeep(base_config);
mobile_config.inbounds = [tun];
const select = mobile_config.outbounds.find((it) => it.tag === "proxy");
select && select.default && delete select.default;

safeMkdir("output");
writeJSONToFile("output/pc_config.json", base_config);
writeJSONToFile("output/mobile_config.json", mobile_config);
