FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm install --prefix client && npm install --prefix server

# Copy source
COPY . .

# Build React frontend
RUN npm run build --prefix client

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
