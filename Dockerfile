FROM node:latest

RUN npm install gulp electron-windows-inno-installer -g
RUN dpkg --add-architecture i386 && apt update && apt install wine32 zip -y

CMD ['electron-windows-inno-installer']
