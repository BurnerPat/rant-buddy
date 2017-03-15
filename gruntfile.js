module.exports = function (grunt) {
    require("load-grunt-tasks")(grunt, {
        scope: "devDependencies"
    });

    const packageJSON = require("./package.json");

    const packager = require("electron-packager");
    const windowsInstaller = require("electron-winstaller");

    const metadata = {
        app: "Rant Buddy",
        author: packageJSON.author,
        version: packageJSON.version,
        license: packageJSON.license
    };

    // No arrow function as we need the "this" binding here
    grunt.registerTask("package-windows", function () {
        const done = this.async();

        packager({
            dir: __dirname,
            arch: "x64",
            platform: "win32",
            out: "build",
            overwrite: true,
            name: "rant_buddy_win64",
            win32metadata: {
                CompanyName: metadata.author,
                ProductName: metadata.app
            }
        }, (err, paths) => {
            if (err) {
                console.err(err);
                done();
            }
            else {
                Promise.all(paths.map(path => {
                    return windowsInstaller.createWindowsInstaller({
                        appDirectory: path,
                        title: metadata.app,
                        authors: metadata.author,
                        exe: "rant_buddy_win64.exe",
                        setupExe: "setup_rant_buddy_win64.exe",
                        name: "rant_buddy_win64",
                        noMsi: true
                    });
                })).then(done);
            }
        });
    });
};