/*
 * Project: c:\Users\mikey\code\user\vscode-fileheader
 * File: extension.js
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');

Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-fileheader" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.sayHello', function() {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);
    vscode.workspace.onDidSaveTextDocument(function(file) {
        setTimeout(function() {
            try {
                var f = file;
                var editor = vscode.editor || vscode.window.activeTextEditor;
                var document = editor.document;
                var isReturn = false;
                var author = ' * @Author: mikey.zhaopeng';
                var authorLine = -1;
                var lastTimeLine = -1;
                var lastTime = ' * @Last Modified time: ';
                var diff = -1;
                for (var i = 0; i < 10; i++) {
                    var line = getLineText(i, editor);
                    if (line.indexOf('@Author') > -1) {
                        authorLine = i;
                    } else if (line.indexOf('@Last\ Modified\ time:') > -1) {
                        lastTimeLine = i;
                        var time = line.replace('@Last\ Modified\ time:', '').replace('*', '');
                        var oldTime = new Date(time);
                        var curTime = new Date();
                        diff = (curTime - oldTime) / 1000;
                        lastTime = lastTime + curTime.format("yyyy-MM-dd hh:mm:ss");
                        break;
                    }
                }
                console.info(diff);
                if ((authorLine != -1) && (lastTimeLine != -1) && (diff > 20)) {

                    replaceLineText(authorLine, author, editor);
                    setTimeout(function() {
                        replaceLineText(lastTimeLine, lastTime, editor);
                        document.save();
                    }, 200);
                }


            } catch (error) {
                console.error(error);
            }
        }, 200);
    });
}





function getLineText(lineNum, editor) {
    const document = editor.document;
    if (lineNum >= document.lineCount) {
        return '';
    }
    const start = new vscode.Position(lineNum, 0);
    const lastLine = document.lineAt(lineNum);
    const end = new vscode.Position(lineNum, lastLine.text.length);
    const range = new vscode.Range(start, end);
    var t = document.getText(range);
    return t;
}

function replaceLineText(lineNum, text, editor) {
    const document = editor.document;
    if (lineNum >= document.lineCount) {
        return '';
    }
    const start = new vscode.Position(lineNum, 0);
    const lastLine = document.lineAt(lineNum);
    const end = new vscode.Position(lineNum, lastLine.text.length);
    const range = new vscode.Range(start, end);
    editor.edit(function(edit) {
        console.info('--------------');
        edit.replace(range, text);
    });

}



exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;