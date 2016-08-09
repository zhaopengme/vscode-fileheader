# vscode-fileheader

## feature

给文件头增加注释,并支持自动更新文件修改时间.

类似如下:

```
/*
 * @Author: mikey.zhaopeng
 * @Date:   2016-07-29 15:57:29
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2016-08-09 13:29:41
 */
```

![fileheader](https://github.com/zhaopengme/vscode-fileheader/raw/master/fileheader.gif)

> Tip: ctrl+alt+i 在可以头部插入注释, ctrl+s 保存文件后,自动更新时间和作者.

## install

按 `F1`,输入`ext install fileheader`.

## 设置

在用户设置里面,设置创建者和修改者的名称.

```
"fileheader.Author": "tom",
"fileheader.LastModifiedBy": "jerry"
```

![name config](https://github.com/zhaopengme/vscode-fileheader/raw/master/name.jpg)

## 快捷键

`ctrl+alt+i` 在可以头部插入注释.

## 更新日志日志

### 1.0.0

1. 支持快捷键插件头部注释
2. 支持保存文件的时候,自动更新时间
3. 支持配置创建者和更新者的名称

