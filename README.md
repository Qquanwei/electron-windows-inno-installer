# Build Your Installer Easy to RELEASE & UPDATE

> demo for https://github.com/Qquanwei/electron-inno-auto-update

## Installation

* `npm install electron-windows-inno-installer -g`

## Building Your Project

* `electron-windows-inno-installer setup.iss`

workflow:
``flow
st=>start: some file js/html/css
e=>end: installer.exe
op1=>operation: electron-prebuild
op2=>operation: gulp-inno
st->op1->op2->e
```
