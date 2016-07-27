/*
 * Project: c:\Users\mikey\code\user\vscode-fileheader
 * File: extension.js
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');

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
        console.info('---33adfasdfasdfasdfsad---');
        for(var i=0;i<10;i++){
            var l = getLineText(i);
            if(l.indexOf('@Author')>-1){
                l = '* @Author: mikey.zhaopeng';
                console.info(l);
                replaceLineText(i,l);
            }
        }

        console.info(getLineText(0));

        const editor = vscode.editor || vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('Ooops...');
        }
        const document = editor.document;
        const lastLine = document.lineAt(document.lineCount - 1);
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(document.lineCount - 1, lastLine.text.length);
        const range = new vscode.Range(start, end);
        var t = document.getText(range);

        console.info(t);
        if (file.languageId == 'javascript') {
            let _workspace = vscode.workspace;
            let _window = vscode.window;
            let _editor = _window.activeTextEditor;
            let _root = _workspace.rootPath;
            setTimeout(function() {
                _editor.edit(function(edit) {
                    console.info('--------------');
                    edit.insert(new vscode.Position(0, 0), 'hello');
                });
            }, 1000);
        }
    });
}


function getLineText(lineNum) {
    const editor = vscode.editor || vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('Ooops...');
    }
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

function replaceLineText(lineNum,text) {
    const editor = vscode.editor || vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('Ooops...');
    }
    const document = editor.document;
    if (lineNum >= document.lineCount) {
        return '';
    }
    const start = new vscode.Position(lineNum, 0);
    const lastLine = document.lineAt(lineNum);
    const end = new vscode.Position(lineNum, lastLine.text.length);
    const range = new vscode.Range(start, end);
    editor.replace(range,text);
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;