# SaaSpocalypse Tracker — Node + Python for frontend + price fetcher
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime: Node + Python
FROM node:20-alpine

RUN apk add --no-cache python3 py3-pip

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./
COPY --from=build /app/backend ./backend
COPY --from=build /app/data ./data
COPY requirements.txt ./

RUN pip3 install --no-cache-dir -r requirements.txt

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
