export interface PlatformConfig {
  app: {
    name: string;
    env: "development" | "test" | "production";
    url: string;
  };
  server: {
    port: number;
    host: string;
  };
  auth: {
    session: {
      strategy: "jwt";
      maxAge: number;
    };
  };
  features: {
    marketplace: boolean;
    multiTenant: boolean;
    plugins: boolean;
  };
  providers: {
    payment: string[];
    storage: string[];
    search: string[];
    shipping: string[];
    tax: string[];
    notification: string[];
  };
}

export const platformConfig: PlatformConfig = {
  app: {
    name: "commercecore",
    env: (process.env.NODE_ENV as PlatformConfig["app"]["env"]) ?? "development",
    url: process.env.APP_URL ?? "http://localhost:3000",
  },
  server: {
    port: parseInt(process.env.PORT ?? "3000", 10),
    host: process.env.HOST ?? "0.0.0.0",
  },
  auth: {
    session: {
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60,
    },
  },
  features: {
    marketplace: true,
    multiTenant: false,
    plugins: true,
  },
  providers: {
    payment: ["stripe"],
    storage: ["s3"],
    search: ["typesense"],
    shipping: ["shippo"],
    tax: ["taxjar"],
    notification: ["email", "sms"],
  },
};
