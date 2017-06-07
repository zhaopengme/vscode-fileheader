/*
 * @Author: mikey.zhaopeng
 * @Date:   2016-07-29 15:57:29
 * @Last Modified by: trongthanh
 * @Last Modified time: 2017-06-07T15:19:38+07:00
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
    console.log('"vscode-fileheader" is now active!');
    var disposable = vscode.commands.registerCommand('extension.fileheader', function () {
        var editor = vscode.editor || vscode.window.activeTextEditor;

        /*
        * @Author: huangyuan
        * @Date: 2017-02-28 17:51:35
        * @Last Modified by:   huangyuan413026@163.com
        * @Last Modified time: 2017-02-28 17:51:35
        * @description: 在当前行插入,而非在首行插入
        */

        var line = editor.selection.active.line;
        editor.edit(function (editBuilder) {
            var time = new Date().format("yyyy-MM-dd hh:mm:ss");
            var data = {
                author: config.Author,
                lastModifiedBy: config.LastModifiedBy,
                createTime: time,
                updateTime: time
            }
            try {
                var tpl = new template(config.tpl).render(data);
                editBuilder.insert(new vscode.Position(line, 0), tpl);
            } catch (error) {
                console.error(error);
            }

        });

    });

    context.subscriptions.push(disposable);
    vscode.workspace.onDidSaveTextDocument(function (/*file*/) {
        setTimeout(function () {
            try {
                // var f = file;
                var editor = vscode.editor || vscode.window.activeTextEditor;
                var document = editor.document;
                // var isReturn = false;
                var authorRange = null;
                var authorText = null;
                var lastTimeRange = null;
                var lastTimeText = null;
                var diff = -1;
                var lineCount = document.lineCount;
                var comment = false;
                for (var i = 0; i < lineCount; i++) {
                    var linetAt = document.lineAt(i);

                    var line = linetAt.text;
                    if (line.startsWith("/*") && !line.endsWith("*/")) {//是否以 /* 开头
                        comment = true;//表示开始进入注释
                    } else if (comment) {
                        if (line.endsWith("*/")) {
                            comment = false;//结束注释
                        }
                        var range = linetAt.range;
                        if (line.toLowerCase().includes('modified by')) {//表示是修改人
                            // .*? is non-greedy expansion and will match "...modified by:"
                            authorRange = range;
                            authorText = line.replace(/(.*?:).*/, `$1 ${config.LastModifiedBy}`);
                        } else if (line.toLowerCase().includes('modified time')) {//最后修改时间
                            // .*? is non-greedy expansion and will match "...modified time:"
                            let time = line.match(/.*?:(.*)/)[1];
                            var oldTime = new Date(time);
                            var curTime = new Date();
                            diff = (curTime - oldTime) / 1000;
                            lastTimeRange = range;
                            // keep first part before : and replace the time
                            lastTimeText= line.replace(/(.*?:).*/, `$1 ${curTime.format("yyyy-MM-dd hh:mm:ss")}`);
                        }
                        if (!comment) {
                            break;//结束
                        }
                    }
                }
                if ((authorRange != null) && (lastTimeRange != null) && (diff > 20)) {
                    setTimeout(function () {
                        editor.edit(function (edit) {
                            edit.replace(authorRange, authorText);
                            edit.replace(lastTimeRange, lastTimeText);
                        });
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
