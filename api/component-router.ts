import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { components } from "@db/schema";
import { like, or } from "drizzle-orm";
import { env } from "./lib/env";

const localComponents = [
  {
    id: 1,
    name: "ESP32-WROOM-32",
    manufacturer: "Espressif",
    category: "Microcontroller",
    description:
      "Wi-Fi and Bluetooth microcontroller module used for IoT projects.",
    datasheetUrl:
      "https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf",
    specs: {
      voltage: "3.0V to 3.6V",
      logic: "3.3V",
      wifi: "2.4GHz 802.11 b/g/n",
    },
    createdAt: new Date(0),
  },
  {
    id: 2,
    name: "ADS1115",
    manufacturer: "Texas Instruments",
    category: "ADC",
    description: "16-bit I2C analog-to-digital converter.",
    datasheetUrl: "https://www.ti.com/lit/ds/symlink/ads1115.pdf",
    specs: {
      resolution: "16-bit",
      interface: "I2C",
      supply: "2.0V to 5.5V",
    },
    createdAt: new Date(0),
  },
  {
    id: 3,
    name: "BME280",
    manufacturer: "Bosch Sensortec",
    category: "Environmental Sensor",
    description: "Temperature, humidity, and pressure sensor.",
    datasheetUrl:
      "https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/",
    specs: {
      interface: "I2C or SPI",
      supply: "1.71V to 3.6V",
      measurements: "Temperature, humidity, pressure",
    },
    createdAt: new Date(0),
  },
];

export const componentRouter = createRouter({
  list: publicQuery.query(async () => {
    if (!env.databaseUrl) {
      return localComponents;
    }

    const db = getDb();
    return db.select().from(components);
  }),

  search: publicQuery
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      if (!env.databaseUrl) {
        const query = input.query.toLowerCase();
        return localComponents.filter(
          component =>
            component.name.toLowerCase().includes(query) ||
            component.manufacturer.toLowerCase().includes(query) ||
            component.category.toLowerCase().includes(query)
        );
      }

      const db = getDb();
      return db
        .select()
        .from(components)
        .where(
          or(
            like(components.name, `%${input.query}%`),
            like(components.manufacturer, `%${input.query}%`),
            like(components.category, `%${input.query}%`)
          )
        );
    }),
});
