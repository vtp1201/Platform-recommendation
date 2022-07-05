FROM node:14.17.3-alpine3.14

WORKDIR /app

RUN npm install -g pm2

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production --silent

COPY . .

CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]
