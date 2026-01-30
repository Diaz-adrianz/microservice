FROM node:20-slim
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

ENV PNPM_STORE_DIR=/pnpm-store

CMD ["pnpm", "dev"]