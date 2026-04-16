FROM node:22-alpine

WORKDIR /app

# Install openssl which is required for Prisma Engine
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD npx prisma db push --accept-data-loss && npm start
