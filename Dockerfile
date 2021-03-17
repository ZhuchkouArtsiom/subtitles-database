FROM node:14

RUN apt-get update &&\
apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget \
xvfb x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps

WORKDIR /var/www/subtitles-database

COPY package*.json ./

RUN npm install

RUN npm i -g sequelize-cli

COPY . .

# tell the port number the container should expose
EXPOSE 3000

RUN mkdir -p /usr/src/app

ADD entrypoint.sh /usr/src/app/

RUN npm run build

RUN ["chmod", "+x", "/usr/src/app/entrypoint.sh"]

# run the command
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
