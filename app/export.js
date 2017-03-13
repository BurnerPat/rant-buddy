const {ipcRenderer, remote} = require("electron");
const {BrowserWindow} = remote;

const path = require("path");

module.exports = class Export {
    static toPDF(editor) {
        return new Promise((resolve, reject) => {
            // atob and btoa are weird with UTF-8 characters
            const exportHTML = editor.getExportHTML(10);

            let win = new BrowserWindow({
                webPreferences: {
                    offscreen: true
                },
                show: false
            });

            win.loadURL(path.normalize(path.join(remote.getGlobal("env").directories.res, "pdf.html")));

            win.on("ready-to-show", () => {
                ipcRenderer.send("exportRequest", exportHTML);

                ipcRenderer.once("exportResponse", (event, arg) => {
                    win.destroy();

                    if (arg) {
                        resolve(Buffer.from(arg, "base64"));
                    }
                    else {
                        reject();
                    }
                });
            });
        });
    }
};