# SaaSpocalypse Tracker — Node + Python for frontend + price fetcher
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Cache bust: invalidates layer when commit changes (Railway injects RAILWAY_GIT_COMMIT_SHA)
ARG RAILWAY_GIT_COMMIT_SHA=unknown
ENV RAILWAY_GIT_COMMIT_SHA=${RAILWAY_GIT_COMMIT_SHA}

COPY . .
RUN npm run build

# Runtime: Node + Python
FROM node:20-alpine

RUN apk add --no-cache python3 py3-pip

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./
RUN npm ci --omit=dev
COPY --from=build /app/backend ./backend
# Data from repo — do NOT mount a volume at /app/data (would serve stale data)
COPY --from=build /app/data ./data
COPY requirements.txt ./

# Use venv to avoid PEP 668 externally-managed-environment
RUN python3 -m venv /app/venv && \
    /app/venv/bin/pip install --no-cache-dir -r requirements.txt
ENV PATH="/app/venv/bin:$PATH"

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
