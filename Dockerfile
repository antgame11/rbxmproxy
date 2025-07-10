FROM node:22

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN chmod +x rbxmk init.sh

CMD ["node", "index.js"]
