# ---- Stage 1: Build ----
FROM docker.m.daocloud.io/library/node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build args for admin access (local only — never deployed to Vercel)
ARG ENABLE_ADMIN=true
ARG ADMIN_TOKEN
ARG ADMIN_PASSWORD

ENV ENABLE_ADMIN=${ENABLE_ADMIN}
ENV ADMIN_TOKEN=${ADMIN_TOKEN}
ENV ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- Stage 2: Run ----
FROM docker.m.daocloud.io/library/node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3100

# Run as non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy config JSON files (needed at runtime by admin API)
COPY --from=builder /app/config ./config

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3100

CMD ["node", "server.js"]
