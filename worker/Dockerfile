FROM node:20-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production
COPY . .

# No EXPOSE command needed since it doesn't receive network traffic
CMD ["npm", "start"]