# electron-windows-inno-installer

## 安装

```
 npm install electron-windows-inno-installer -g
```

## 安装依赖

mac 下使用homebrew, debian系使用apt, 或者直接使用下面的使用Docker构建.

```
brew install wine --devel  # apt install wine
npm install gulp -g
```

## 构建过程

使用inno-setup需要一个inno配置文件，如果已经已经存在可以按照example.iss的内容更改一些配置，因为在配置过程中需要一些路径正确配置。如果没有配置文件可以使用`electron-windows-inno-install --make-iss` 手动生成一份，该命令会在当前目录下生成`example.iss`，注意需要手动`vim example.iss`配置一些路径才可以使用，因为随着生成x64/win32的不同生成的文件名也不相同。

配置完成之后下面的命令开始构建

```
rm -rf release/
electron-windows-inno-installer ./setup.iss --platform win32-x64 --icon ./favicon.ico
```

`icon`参数为可选参数。 `setup.iss` 为最终的inno配置文件


electron-windows-inno-installer 会将你当前目录下所有文件打包，但是不会打包目录。实际上默认的打包规则常常是无用的，因为我们只想打包我们程序依赖的编译后的资源文件（而不打包源代码）。可以在`package.json`中指定需要打包的目录，文件.

```
 {
 ...
 "sourceFiles": ["./index.js", "./favicon.icon", "./www/**/**"]
 ...
 }
```

### 使用Docker构建

```
docker run --rm -v ${pwd}:/app -w /app/ quanwei/electron-windows-inno-installer electron-windows-inno-installer ./example.iss --platform win32-x64
```

### inno setup 配置

主要有下面两行需要重新配置

- #define SourcePath "release/v1.4.3/win32-ia32/"

格式为`release/{electron-version}/{platform}`. electron-version 是 electron-windows-inno-install 决定的，目前两个版本号保持一致。

- #define MyAppExeName "example.exe"

格式为`{package.json.name}.exe`

上面两个变量需要正确配置。因为是由inno-setup目前和js不共用一套配置，所以需要手动的更改这两个变量。



# 常见问题

## 打包过程中下载electron失败

download the file from https://github.com/electron/electron/releases or https://npm.taobao.org/mirrors/electron/ to directory .cache/{version}/{platform}.
