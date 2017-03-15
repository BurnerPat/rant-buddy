const fs = require("fs");
const zlib = require("zlib");

const Highlighter = require("./highlighter");

module.exports = class Editor {
    constructor() {

    }

    get content() {
        return this._content;
    }

    get file() {
        return this._file;
    }

    create(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    this._code = data.toString();
                    this._file = file;
                    this._type = Highlighter.Type.fromFile(file);

                    resolve();
                }
            });
        });
    }

    load(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    let obj = JSON.parse(data);

                    zlib.gunzip(Buffer.from(obj.src, "base64"), (err, buffer) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            this._code = buffer.toString();

                            this._savedState = obj.comments;
                            this._type = obj.type;

                            this._file = file;

                            resolve();
                        }
                    });
                }
            });
        });
    }

    save(file) {
        return new Promise((resolve, reject) => {
            let state = this.state;

            if (Object.keys(state).length === 0) {
                return;
            }

            zlib.gzip(Buffer.from(this._code), (err, buffer) => {
                if (err) {
                    reject(err);
                }
                else {
                    let obj = {
                        comments: state,
                        type: this._type,
                        src: buffer.toString("base64")
                    };

                    fs.writeFile(file, JSON.stringify(obj, null, 2), (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            this._file = file;
                            resolve();
                        }
                    });
                }
            });
        });
    }

    place(target) {
        if (!this._code) {
            throw new Error("Editor is not loaded");
        }

        this._content = $("<div class='editor'></div>");

        Highlighter.highlight(this._type, this._code.toString()).then(html => {
            html.split(/\n(?!$)/g).forEach((text, i) => {
                let lineNumber = $("<span class='lineNumber'></span>").html(i + 1);
                let lineCode = $("<span class='code'></span>").html(`<pre><code>${text}</code></pre>`);

                let line = $(`<div class="line line-${i + 1}"></div>`).data("number", i + 1).append(lineNumber).append(lineCode);

                line.click(this.showCommentInput.bind(this, line));

                this._content.append(line);
            });

            if (this._savedState) {
                this.state = this._savedState;
                delete this._savedState;
            }

            target.append(this._content);
        });
    }

    get state() {
        let state = {};

        this._content.find(".line").each((i, line) => {
            let number = $(line).data("number");
            let comment = $(line).data("comment");

            if (comment && comment.trim().length > 0) {
                state[number] = comment;
            }
        });

        return state;
    }

    set state(state) {
        for (let i in state) {
            if (state.hasOwnProperty(i)) {
                let line = this._content.find(`.line.line-${i}`);

                if (line) {
                    this.updateComment(line, state[i]);
                }
            }
        }
    }

    showCommentInput(line) {
        let minRows = 5;
        let input = $("<textarea cols='999' rows='5'></textarea>");

        let savedComment = line.data("comment");
        if (savedComment) {
            input.val(savedComment);
        }

        line.next(`.comment.comment-${line.data("number")}`).remove();

        input.keyup(e => {
            if (e.keyCode === 27) {
                input.remove();
                this.updateComment(line, line.data("comment"));
            }
        });

        input.keyup(() => {
            let text = input.val();
            let match = text.match(/\n/g);

            input.attr("rows", Math.max(match && (match.length + 1), minRows));
        });

        input.blur(() => {
            let text = input.val().trim();
            input.remove();
            this.updateComment(line, text);
        });

        let wrapper = $("<div class='comment-prompt'></div>").append(input);
        line.after(wrapper);

        input.focus();
    }

    updateComment(line, text) {
        if (!text || text.length === 0) {
            line.removeData("comment");

            line.next(`.comment.comment-${line.data("number")}`).remove();
        }
        else {
            line.data("comment", text);

            let comment = $(`<div class="comment comment-${line.data("number")}"></div>`).html(Editor.formatText(text));

            comment.click(() => {
                this.showCommentInput(line);
            });

            line.after(comment);
        }
    }

    getExportHTML(around) {
        let state = this.state;
        let content = $(this.content).clone();

        const commentLines = Object.keys(state).sort((x, y) => {
            return Number(x) - Number(y);
        });

        let targetLines = [];

        commentLines.forEach(l => {
            l = parseInt(l, 10);

            for (let i = Math.max(1, l - around); i <= l + around; i++) {
                if (targetLines.indexOf(i) < 0) {
                    targetLines.push(i);
                }
            }
        });

        let lastNumber = 0;

        content.find(".line").each((i, line) => {
            line = $(line);

            // clone() does not copy data attributes
            let number = parseInt(line.attr("class").match(/line-(\d+)/)[1], 10);

            if (targetLines.indexOf(number) >= 0) {
                if (number - lastNumber > 1 && lastNumber > 0) {
                    line.before($("<div class='skip'></div>"));
                }

                lastNumber = number;
            }
            else {
                line.remove();
            }
        });

        return content[0].outerHTML;
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