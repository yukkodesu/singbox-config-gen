export const shadowsocksHandler = (clashProxy) => {
  const it = clashProxy;
  return {
    tag: it.name,
    type: "shadowsocks",
    server: it.server,
    server_port: Number(it.port),
    method: it.cipher,
    password: it.password,
    plugin: it.plugin?.includes("obfs") ? "obfs-local" : undefined,
    plugin_opts:
      it.plugin && it.plugin.includes("obfs")
        ? `obfs=${it["plugin-opts"]?.mode};obfs-host=${it["plugin-opts"]?.host}`
        : undefined,
  };
};
