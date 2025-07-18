FROM node:22

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN chmod +x lune init.sh

CMD sh -c "./init.sh && node index.js"
