FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy only the packages needed by the API
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/

# Install deps (need tsx + devDeps for running TS at runtime)
RUN pnpm install --frozen-lockfile \
    --filter @zanalytics/api... \
    --filter @zanalytics/db

# Copy source
COPY apps/api/ apps/api/
COPY packages/db/src/ packages/db/src/
COPY packages/db/tsconfig.json packages/db/

WORKDIR /app/apps/api

EXPOSE 8080

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
