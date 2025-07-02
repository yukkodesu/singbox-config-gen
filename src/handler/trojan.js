export const trojanHandler = (it) => {
  return {
    type: "trojan",
    tag: it.name,
    server: it.server,
    server_port: Number(it.port),
    password: it.password,
    tls: {
      enabled: true,
      server_name: it.sni,
      insecure: !!it["skip-cert-verify"],
    },
  };
};
