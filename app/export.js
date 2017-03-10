const remote = require("electron").remote;
const {BrowserWindow} = remote;

const path = require("path");

module.exports = class Export {
    static toPDF(editor) {
        return new Promise((resolve, reject) => {
            const exportHTML = btoa(editor.getExportHTML(10));

            let win = new BrowserWindow({
                webPreferences: {
                    offscreen: true
                },
                show: false
            });

            win.loadURL(path.normalize(path.join(remote.getGlobal("env").directories.res, "pdf.html")));

            win.on("ready-to-show", () => {
                win.webContents.executeJavaScript(`document.body.innerHTML=atob("${exportHTML}");`).then(() => {
                    win.webContents.printToPDF({
                        pageSize: "A4",
                        printBackground: false
                    }, (err, data) => {
                        win.destroy();

                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(data);
                        }
                    });
                });
            });
        });
    }
};