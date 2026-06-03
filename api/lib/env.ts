import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";
const allowMissingConfig = process.env.EMBEDDEDGPT_LOCAL_TEST === "true";

function required(name: string): string {
  const value = process.env[name];
  if (!value && isProduction && !allowMissingConfig) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction,
  allowMissingConfig,
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
};
