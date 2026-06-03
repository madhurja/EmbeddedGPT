process.env.NODE_ENV = "production";
process.env.EMBEDDEDGPT_LOCAL_TEST = "true";
process.env.PORT ||= "4173";

await import("../dist/boot.js");
