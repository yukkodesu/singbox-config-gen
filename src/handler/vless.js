export const vlessHandler = (clashProxy) => {
  const it = clashProxy;
  const reality = it["reality-opts"];
  return {
    type: "vless",
    tag: it.name,
    server: it.server,
    server_port: Number(it.port),
    uuid: it.uuid,
    flow: it.flow,
    tls: {
      enabled: !!it.tls,
      insecure: !!it["skip-cert-verify"],
      server_name: it.servername,
      ...(reality ? {
        reality: {
          enabled: true,
          public_key: reality["public-key"],
          short_id: reality["short-id"],
        }
      } : {}),
      utls: {
        enabled: !!it["client-fingerprint"],
        fingerprint: it["client-fingerprint"],
      },
    },
  };
};
