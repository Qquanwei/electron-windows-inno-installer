FROM node:latest

RUN npm install gulp -g
RUN dpkg --add-architecture i386
RUN apt-get update 
RUN apt install wine32 zip -y

COPY . /opt/electron-windows-inno-installer
RUN cd /opt/electron-windows-inno-installer && npm install

ENTRYPOINT ["node", "/opt/electron-windows-inno-installer/cli.js"]
