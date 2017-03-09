const remote = require("electron").remote;
const {Menu, dialog} = remote;

const Editor = require("./editor");

const menu = Menu.buildFromTemplate([
    {
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
    },
    {
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
    }
]);

remote.getCurrentWindow().setMenu(menu);