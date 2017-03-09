"use strict";

const {dialog} = require("electron").remote;
const fs = require("fs");
const path = require("path");

window.$ = window.jQuery = require("jquery");

const Editor = require("./editor");

$(document).ready(() => {
    let file = dialog.showOpenDialog({
        properties: ["openFile"]
    })[0];

    let editor = new Editor(file);

    editor.load().then(() => {
        editor.create($("#code"));
    });
});
