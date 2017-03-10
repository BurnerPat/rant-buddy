const remote = require("electron").remote;

const fs = require("fs");
const path = require("path");

module.exports = class App {
    static loadThemes() {
        if (App.themes.length > 0) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            App._themes = {};

            const styleDir = remote.getGlobal("env").directories.style;

            fs.readdir(styleDir, (err, files) => {
                if (err) {
                    reject(err);
                }
                else {
                    Promise.all(files.map((file) => {
                            if (/\.theme\.css$/.test(file)) {
                                return new Promise((resolve, reject) => {
                                    file = path.normalize(path.join(styleDir, file));

                                    fs.readFile(file, (err, data) => {
                                        if (err) {
                                            reject(err);
                                        }
                                        else {
                                            let match = data.toString().match(/@theme\(([^)]+)\)/);

                                            if (match && match.length === 2) {
                                                App._themes[match[1]] = file;
                                                resolve();
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    )).then(resolve);
                }
            });
        });
    }

    static get themes() {
        return App._themes ? Object.keys(App._themes) : [];
    }

    static set theme(theme) {
        theme = App._themes[theme];

        if (!theme) {
            return;
        }

        $("#theme").remove();
        $("<link id='theme' rel='stylesheet'>").attr("href", "./style/" + path.basename(theme)).appendTo($("head"));
    }
};