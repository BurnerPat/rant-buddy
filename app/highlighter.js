const prism = require("prismjs");
const path = require("path");

const fileTypeMap = {
    "abap": [".abap"],
    "javascript": [".js"],
    "text": [".txt"]
};

class Type {
    static fromFile(file) {
        const extName = path.extname(file);

        if (!extName || extName.length === 0) {
            return "text";
        }

        let type = "text";

        Object.keys(fileTypeMap).forEach(key => {
            fileTypeMap[key].forEach(ext => {
                if (ext === extName) {
                    type = key;
                }
            });
        });

        return type;
    }
}

class Highlighter {
    static highlight(type, src) {
        if (!prism.languages[type]) {
            try {
                require(`prismjs/components/prism-${type}`);
            }
            catch (err) {
                // We probably only failed to find the file, hence we are (most probably) fine
            }
        }

        const language = prism.languages[type];

        if (language) {
            return new Promise(resolve => {
                resolve(prism.highlight(src, language));
            });
        }
        else {
            return Promise.resolve(src);
        }
    }
}

Highlighter.Type = Type;

module.exports = Highlighter;