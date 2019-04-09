FROM node:latest

COPY . /opt/electron-windows-inno-installer

RUN cd /opt/electron-windows-inno-installer && npm install
RUN npm install gulp -g
RUN dpkg --add-architecture i386
RUN apt-get update 
RUN apt install wine32 zip -y

ENTRYPOINT ["node", "/opt/electron-windows-inno-installer/cli.js"]
