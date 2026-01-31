import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  colorize(),
  printf(({ level, message, timestamp, stack }) => {
    return stack
      ? `${timestamp} ${level}: ${message} - ${stack}`
      : `${timestamp} ${level}: ${message}`;
  })
);

const logger = createLogger({
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    }),
  ],
});

export { logger };
