export type SingboxConfig = {
  outbounds: OutBounds[];
  inbounds: InBounds[];
  route: {
    rule_set: {
      type: string;
      tag: string;
      format: "binary" | "source";
      url: string;
      download_detour?: string;
    }[];
  };
};

type OutBounds = {
  type: string;
  tag: string;
  server?: string;
  server_port?: number;
  method?: string;
  outbounds?: string[];
  default?: string;
  password?: string;
};
type InBounds = {
  type: string;
  tag: string;
  listen?: string;
  listen_port?: number;
  set_system_proxy?: boolean;
};

export type ClashProxy = {
  name: string;
  type: string;
  server: string;
  port: string;
  cipher: string;
  password: string;
  udp?: boolean;
  plugin?: string;
  "plugin-opts"?: Record<string, string>;
};
