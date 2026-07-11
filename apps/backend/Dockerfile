# Build from the REPO ROOT, not this directory — the backend depends on
# workspace packages that live outside it:
#
#   docker build -f apps/backend/Dockerfile -t pandorlabs-backend .
FROM node:24-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build

# Manifests first, so a source-only change reuses the install layer.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile --filter @pandorlabs/backend...

COPY packages/types ./packages/types
COPY apps/backend ./apps/backend

RUN pnpm --filter @pandorlabs/backend... build
RUN pnpm prune --prod

FROM base AS runtime
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/types ./packages/types
COPY --from=build /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/

WORKDIR /app/apps/backend
EXPOSE 3001
CMD ["node", "dist/main"]
