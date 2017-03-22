const remote = require("electron").remote;
const {Menu, MenuItem, dialog} = remote;

const fs = require("fs");
const path = require("path");

const Editor = require("./editor");
const App = require("./app");
const Export = require("./export");

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

                rant.editor = new Editor();

                rant.editor.on("ready", editor => {
                    App.setTitle(editor.file, false);
                });

                rant.editor.on("change", editor => {
                    App.setTitle(editor.file, true);
                });

                rant.editor.on("save", editor => {
                    App.setTitle(editor.file, false);
                });

                (path.extname(file) === ".rant" ? rant.editor.load(file) : rant.editor.create(file)).then(
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
                    let file = rant.editor.file;

                    if (!file || path.extname(file) !== ".rant") {
                        file = dialog.showSaveDialog({
                            defaultPath: (file ? file + ".rant" : "unnamed.rant"),
                            filters: [
                                {
                                    name: "Rant file",
                                    extensions: ["rant"]
                                }
                            ]
                        });
                    }

                    rant.editor.save(file);
                }
            }
        },
        {
            label: "Save as...",
            accelerator: "Ctrl+Shift+S",
            click() {
                if (rant.editor) {
                    let file = dialog.showSaveDialog({
                        defaultPath: (rant.editor.file ? rant.editor.file + ".rant" : "unnamed.rant"),
                        filters: [
                            {
                                name: "Rant file",
                                extensions: ["rant"]
                            }
                        ]
                    });

                    rant.editor.save(file);
                }
            }
        },
        {
            label: "Export as PDF...",
            accelerator: "Ctrl+Shift+E",
            click() {
                if (rant.editor) {
                    Export.toPDF(rant.editor).then(buffer => {
                        let file = dialog.showSaveDialog({
                            defaultPath: (rant.editor.file ? rant.editor.file + ".rant.pdf" : "export.pdf"),
                            filters: [
                                {
                                    name: "Portable Document Format",
                                    extensions: ["pdf"]
                                }
                            ]
                        });

                        fs.writeFile(file, buffer);
                    });
                }
            }
        }
    ]
}));

menu.append(new MenuItem({
    label: "Edit",
    submenu: [
        {
            label: "Goto line...",
            accelerator: "Ctrl+L",
            click() {
                App.prompt("Enter line number").then(App.scrollTo);
            }
        },
        {
            label: "Goto previous comment",
            accelerator: "Ctrl+Up",
            click: App.goToPreviousComment
        },
        {
            label: "Goto next comment",
            accelerator: "Ctrl+Down",
            click: App.goToNextComment
        },
        {
            label: "Open DevTools...",
            accelerator: "F12",
            click () {
                remote.getCurrentWindow().openDevTools();
            }
        }
    ]
}));

const themeMenu = new Menu();

menu.append(new MenuItem({
    label: "Themes",
    submenu: themeMenu
}));

App.loadThemes().then(() => {
    App.themes.forEach((theme) => {
        themeMenu.append(new MenuItem({
            label: theme,
            click() {
                App.theme = theme;
            }
        }));

        remote.getCurrentWindow().setMenu(menu);
    });
});

remote.getCurrentWindow().setMenu(menu);