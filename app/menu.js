const remote = require("electron").remote;
const {Menu, MenuItem, dialog} = remote;

const fs = require("fs");
const path = require("path");

const Editor = require("./editor");

const menu = new Menu();

menu.append(new MenuItem({
    label: "File",
    submenu: [
        {
            label: "Open...",
            accelerator: "Ctrl+O",
            click () {
                let file = dialog.showOpenDialog({
                    properties: ["openFile"]
                })[0];

                rant.editor = new Editor(file);

                rant.editor.load().then(
                    () => {
                        let main = $("#main");
                        main.empty();
                        rant.editor.place(main);
                    },
                    (err) => {
                        alert(JSON.stringify(err, null, 2));
                        delete rant.editor;
                    }
                );
            }
        },
        {
            label: "Save",
            accelerator: "Ctrl+S",
            click () {
                if (rant.editor) {
                    rant.editor.save();
                }
            }
        }
    ]
}));

const themeMenu = new Menu();

menu.append(new MenuItem({
    label: "Themes",
    submenu: themeMenu
}));

menu.append(new MenuItem({
    label: "Utilities",
    submenu: [
        {
            label: "Open DevTools...",
            accelerator: "F12",
            click () {
                remote.getCurrentWindow().openDevTools();
            }
        }
    ]
}));

const styleDir = remote.getGlobal("env").directories.style;

fs.readdir(styleDir, (err, files) => {
    if (err) {
        throw new Error("Failed to read styles directory");
    }

    files.forEach((file) => {
        if (/\.theme\.css$/.test(file)) {
            file = path.normalize(path.join(styleDir, file));

            fs.readFile(file, (err, data) => {
                if (err) {
                    return;
                }

                let match = data.toString().match(/@theme\(([^)]+)\)/);

                if (match && match.length === 2) {
                    themeMenu.append(new MenuItem({
                        label: match[1],
                        click() {
                            $("#theme").remove();
                            $("<link id='theme' rel='stylesheet'>").attr("href", "./style/" + path.basename(file)).appendTo($("head"));
                        }
                    }));

                    remote.getCurrentWindow().setMenu(menu);
                }
            });
        }
    });
});

remote.getCurrentWindow().setMenu(menu);