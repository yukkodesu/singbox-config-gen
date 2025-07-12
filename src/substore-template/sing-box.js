const outboundNamingMap = {
  "🇭🇰 Hong Kong": /香港|Hong\s*Kong|HK|hk|hong\s*kong|HONG\s*KONG|港|HongKong/i,
  "🇸🇬 Singapore":
    /新加坡|Singapore|SG|sg|singapore|SINGAPORE|狮城|坡县|星洲|星国|Lion\s*City/i,
  "🇯🇵 Japan":
    /日本|Japan|JP|jp|japan|JAPAN|東京|东京|大阪|京都|横滨|名古屋|神户|福冈|札幌|仙台|広島|广岛|北海道|本州|九州|四国|関西|关西|関東|关东|Nippon|nippon|NIPPON/i,
  "🇺🇸 United States":
    /美国|United\s*States|USA|US|us|usa|America|america|AMERICA|美利坚|纽约|New\s*York|洛杉矶|Los\s*Angeles|芝加哥|Chicago|休斯顿|Houston|费城|Philadelphia|凤凰城|Phoenix|圣安东尼奥|San\s*Antonio|圣地亚哥|San\s*Diego|达拉斯|Dallas|圣何塞|San\s*Jose|奥斯汀|Austin|加州|California|德州|Texas|佛州|Florida|纽约州|New\s*York\s*State|华盛顿|Washington|拉斯维加斯|Las\s*Vegas|迈阿密|Miami|西雅图|Seattle|波士顿|Boston|亚特兰大|Atlanta|丹佛|Denver|底特律|Detroit|明尼阿波利斯|Minneapolis|坦帕|Tampa|布鲁克林|Brooklyn|皇后区|Queens|曼哈顿|Manhattan|硅谷|Silicon\s*Valley/i,
  "🇨🇳 Taiwan":
    /台湾|臺灣|Taiwan|taiwan|TAIWAN|TW|tw|台北|臺北|Taipei|taipei|高雄|Kaohsiung|kaohsiung|台中|臺中|Taichung|taichung|台南|臺南|Tainan|tainan|桃园|桃園|Taoyuan|taoyuan|新竹|Hsinchu|hsinchu|基隆|Keelung|keelung|嘉义|嘉義|Chiayi|chiayi|台东|臺東|Taitung|taitung|花莲|花蓮|Hualien|hualien/i,
  "🇩🇪 Germany":
    /德国|德國|Germany|germany|DE|de|Deutschland|deutschland|柏林|Berlin|慕尼黑|Munich|汉堡|Hamburg|科隆|Cologne|法兰克福|Frankfurt|斯图加特|Stuttgart|杜塞尔多夫|Düsseldorf|多特蒙德|Dortmund|埃森|Essen|莱比锡|Leipzig|不来梅|Bremen|德累斯顿|Dresden|汉诺威|Hannover|纽伦堡|Nuremberg|巴伐利亚|Bavaria|黑森|Hessen|萨克森|Saxony|北莱茵|巴登|符腾堡|图林根|勃兰登堡|Brandenburg/i,
  "🇬🇧 United Kingdom":
    /英国|英國|United\s*Kingdom|UK|uk|Britain|britain|Great\s*Britain|GB|gb|England|england|Scotland|scotland|Wales|wales|Northern\s*Ireland|伦敦|London|london|曼彻斯特|Manchester|manchester|利物浦|Liverpool|liverpool|伯明翰|Birmingham|birmingham|利兹|Leeds|leeds|格拉斯哥|Glasgow|glasgow|爱丁堡|Edinburgh|edinburgh/i,
};
let config = JSON.parse($content);

let proxies = await produceArtifact({
  name: $options._req.query.name,
  type: "subscription",
  platform: "sing-box",
  produceType: "internal",
});

config.outbounds.push(...proxies);
const proxySelector = config.outbounds.find((item) => item.tag === "proxy");
proxySelector.outbounds.push(...proxies.map((item) => item.tag));

const outboundNamingMapEntries = Object.entries(outboundNamingMap);
const outboundSelector = new Map();
outboundNamingMapEntries.forEach(([key, _]) => {
  const outbound = config.outbounds.find((item) => item.tag === key);
  outboundSelector.set(key, outbound);
});

const others = config.outbounds.find((item) => item.tag === "Others");
outboundSelector.set("Others", others);

// outbound split
for (const item of proxies) {
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
  others.outbounds.push("direct");
}

const device = $options._req.query.device;
if (device === 'pc') {
  const pcInbound = config.inbounds.find((item) => item.tag === "mixed-in");
  pcInbound["set_system_proxy"] = true;
} else {
  config.inbounds = [{
    "type": "tun",
    "address": ["172.18.0.1/30", "fdfe:dcba:9876::1/126"],
    "auto_route": true,
    "strict_route": true
  }
  ];
}

$content = JSON.stringify(config, null, 2);
