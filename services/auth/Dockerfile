FROM node:20-slim AS base
WORKDIR /app

# pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# ---- deps (cached) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules

COPY tsconfig*.json ./
COPY prisma ./prisma
COPY src ./src
COPY package.json ./package.json

RUN pnpm build

# ---- runtime ----
FROM node:20-slim AS runtime
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

CMD ["pnpm", "start"]
