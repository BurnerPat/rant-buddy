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
        return Promise.all([
            new Promise((resolve, reject) => {
                fs.readFile(this.file, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        this._code = data.toString();
                        resolve();
                    }
                });
            }),
            new Promise((resolve, reject) => {
                let saved = this.file + ".rant.json";

                fs.access(saved, fs.constants.R_OK, err => {
                    if (!err) {
                        fs.readFile(this.file + ".rant.json", (err, data) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                this._savedState = JSON.parse(data);
                                resolve();
                            }
                        });
                    }
                    else {
                        resolve();
                    }
                });
            })
        ]);
    }

    save() {
        return new Promise((resolve, reject) => {
            let state = this.state;

            if (Object.keys(state).length === 0) {
                return;
            }

            fs.writeFile(this.file + ".rant.json", JSON.stringify(state, null, 2), err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }

    place(target) {
        if (!this._code) {
            throw new Error("Editor is not loaded");
        }

        this._editor = $("<div class='editor'></div>");

        let html = prism.highlight(this._code.toString(), prism.languages.javascript);

        html.split(/\n(?!$)/g).forEach((text, i) => {
            let lineNumber = $("<span class='lineNumber'></span>").html(i + 1);
            let lineCode = $("<span class='code'></span>").html(`<pre><code>${text}</code></pre>`);

            let line = $(`<div class="line line-${i + 1}"></div>`).data("number", i + 1).append(lineNumber).append(lineCode);

            line.click(this.showCommentInput.bind(this, line));

            this._editor.append(line);
        });

        if (this._savedState) {
            this.state = this._savedState;
            delete this._savedState;
        }

        target.append(this._editor);
    }

    get state() {
        let state = {};

        this._editor.find(".line").each((i, line) => {
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
                let line = this._editor.find(`.line.line-${i}`);

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

        let wrapper = $("<div></div>").append(input);
        line.after(wrapper);

        input.focus();
    }

    updateComment(line, text) {
        if (text.length === 0) {
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

    static formatText(text) {
        text = `<p>${text.replace(/\n\n/g, "</p><p>")}</p>`;

        text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "<em><strong>$1</strong></em>");
        text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

        text = text.replace(/`([^`]*)`/g, "<code>$1</code>");

        return text;
    }
};