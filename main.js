"use strict";

const {app, BrowserWindow, Menu} = require("electron");
const path = require("path");
const url = require("url");

let window;

global.env = {
    directories: {
        app: path.normalize(path.join(__dirname, "app")),
        style: path.normalize(path.join(__dirname, "style")),
        res: path.normalize(path.join(__dirname, "res"))
    }
};

function createWindow() {
    window = new BrowserWindow({
        width: 1024,
        height: 768
    });

    window.setMenu(new Menu());

    window.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    window.on("closed", () => {
        window = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (window == null) {
        createWindow();
    }
});