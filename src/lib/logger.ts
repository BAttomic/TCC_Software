import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino(
  {
    base: { service: "ticketflow" },
    transport: isDev ? { target: "pino-pretty", options: { colorize: true } } : undefined,
  },
);

export type Logger = typeof logger;
