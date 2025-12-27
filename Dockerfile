FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

# В продакшене будет "npm start", в разработке — "npm run dev" (через docker-compose)
CMD ["npm", "start"]