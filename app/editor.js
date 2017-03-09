const fs = require("fs");
const prism = require("prismjs");

module.exports = class Editor {
    constructor(file) {
        this._file = file;
    }

    get file() {
        return this._file;
    }

    load() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.file, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    this._code = data.toString();
                    resolve();
                }
            });
        });
    }

    create(target) {
        if (!this._code) {
            throw new Error("Editor is not loaded");
        }

        let html = prism.highlight(this._code.toString(), prism.languages.javascript);

        html.split(/\n(?!$)/g).forEach((text, i) => {
            let lineNumber = $("<span></span>").addClass("lineNumber").html(i + 1);
            let lineCode = $("<span></span>").addClass("code").html(text);

            let line = $("<div></div>").addClass(`line line-${i + 1}`).data("number", i + 1).append(lineNumber).append(lineCode);

            line.click(this.showCommentInput.bind(this, line));

            target.append(line);
        });

        target.addClass("editor");
    }

    showCommentInput(line) {
        let minRows = 5;
        let input = $("<textarea></textarea>").attr("cols", 999).attr("rows", 5);

        input.keyup(() => {
            let text = input.val();
            let match = text.match(/\n/g);

            input.attr("rows", Math.max(match && (match.length + 1), minRows));
        });

        input.blur(() => {
            let text = input.val().trim();
            input.remove();

            if (text.length === 0) {
                line.removeData("comment");

                line.next(`.comment.comment-${line.data("number")}`).remove();
            }
            else {
                line.data("comment", text);

                let comment = $("<div></div>").addClass(`comment comment-${line.data("number")}`).html(Editor.formatText(text));
                line.after(comment);
            }
        });

        let wrapper = $("<div></div>").append(input);
        line.after(wrapper);

        input.focus();
    }

    static formatText(text) {
        text = `<p>${text.replace(/\n\n/g, "</p><p>")}</p>`;

        text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "<em><strong>$1</strong></em>");
        text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

        text = text.replace(/`([^`]*)`/g, "<code>$1</code>");

        return text;
    }
};