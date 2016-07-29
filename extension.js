/*
 * @Author: mikey.zhaopeng
 * @Date:   2016-07-29 15:57:29
 * @Last Modified by:   mikey.zhaopeng
 * @Last Modified time: 2016-07-29 16:43:41
 */

var vscode = require('vscode');

Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

function activate(context) {
    var config = vscode.workspace.getConfiguration('fileheader');
    console.info(config);
    console.log('"vscode-fileheader" is now active!');
    var disposable = vscode.commands.registerCommand('extension.fileheader', function () {
        var editor = vscode.editor || vscode.window.activeTextEditor;
        editor.edit(function (editBuilder) {
            var time = new Date().format("yyyy-MM-dd hh:mm:ss");
            var data = {
                author: config.Author,
                lastModifiedBy: config.LastModifiedBy,
                createTime: time,
                updateTime: time
            }
            try {
            var tpl = new template(config.tpl).render(data);;
            console.info(tpl);
            editBuilder.insert(new vscode.Position(0, 0), tpl);
            } catch (error) {
                console.error(error);
            }

        });

    });

    context.subscriptions.push(disposable);
    vscode.workspace.onDidSaveTextDocument(function (file) {
        setTimeout(function () {
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
                    setTimeout(function () {
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

function getConfiguration() {
    return vscode.workspace.getConfiguration('mocha');
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
    editor.edit(function (edit) {
        edit.replace(range, text);
    });

}



/**
 * template engine
 */
function template(tpl) {
    var
        fn,
        match,
        code = ['var r=[];\nvar _html = function (str) { return str.replace(/&/g, \'&amp;\').replace(/"/g, \'&quot;\').replace(/\'/g, \'&#39;\').replace(/</g, \'&lt;\').replace(/>/g, \'&gt;\'); };'],
        re = /\{\s*([a-zA-Z\.\_0-9()]+)(\s*\|\s*safe)?\s*\}/m,
        addLine = function (text) {
            code.push('r.push(\'' + text.replace(/\'/g, '\\\'').replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '\');');
        };
    while (match = re.exec(tpl)) {
        if (match.index > 0) {
            addLine(tpl.slice(0, match.index));
        }
        if (match[2]) {
            code.push('r.push(String(this.' + match[1] + '));');
        }
        else {
            code.push('r.push(_html(String(this.' + match[1] + ')));');
        }
        tpl = tpl.substring(match.index + match[0].length);
    }
    addLine(tpl);
    code.push('return r.join(\'\');');
    fn = new Function(code.join('\n'));
    this.render = function (model) {
        return fn.apply(model);
    };
}


exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;