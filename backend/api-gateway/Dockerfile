FROM node:18
<<<<<<< HEAD
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
=======

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8080
CMD ["npm", "start"]
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
