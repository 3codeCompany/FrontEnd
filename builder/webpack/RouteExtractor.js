var exec = require("child_process").exec;
const fs = require("fs");
const path = require("path");
let routeEqualizer = "";

const extractor = function (basePath, targetComponentFile, targetSassFile, production = false) {
    let command = "php bin/console debug:router --json";

    console.log("Route check ...");
    exec(command, {maxBuffer: 1024 * 500, cwd: basePath}, function (error, stdout, stderr) {
        if (!error) {
            let route = JSON.parse(stdout);
            const routeSimplyfied = Object.entries(route).map(([index, el]) => [
                el._controller,
                el._method,
                el._routePath,
                el._package,
                el._debug.templateExists,
                el._debug.componentExists
            ]);
            const toEqual = JSON.stringify(routeSimplyfied);
            if (toEqual != routeEqualizer) {
                routeEqualizer = toEqual;
                generateRouteAssetsFromJson(route, targetComponentFile, targetSassFile, basePath, production);
            } else {
                console.log("No changes");
            }
        } else {
            console.log("not worked");
            console.log(stdout);
            console.log(stderr);
        }
    });
};

generateRouteAssetsFromJson = function (conf, SAVE_COMPONENT_TARGET, SAVE_SASS_TARGET, BASE_PATH, production) {
    let ComponentFileContent = "";
    let ComponentFileContentMapFilesX = {};
    let SassFileContent = "";

    let namespace = {};

    for (i in conf) {
        let componentPath = BASE_PATH + conf[i]._debug.template + ".component.tsx";
        let sassPath = BASE_PATH + conf[i]._debug.template + ".component.sass";

        if (conf[i]._debug.componentExists) {
            let name = (i + conf[i]._routePath)
                .replace("/", "")
                .replace(/\//g, "_")
                .replace(/\{/g, "_")
                .replace(/\}/g, "_")
                .replace(/\-/g, "_");


            let tmpNamespace = name.split("_")[0];

            if (namespace[tmpNamespace] === undefined) {
                namespace[tmpNamespace] = [];
            }
            namespace[tmpNamespace].push(componentPath.replace(/\\/g, "/"));

            if (!production) {
                ComponentFileContent += "import " + name + " from '" + componentPath.replace(/\\/g, "/") + "';\n";
                ComponentFileContent += " export { " + name + "}; \n";
            }
            conf[i].component = name;
            conf[i].index = namespace[tmpNamespace].length - 1;
            conf[i].namespace = tmpNamespace;

            if (production) {
                delete conf[i]._controller;
                delete conf[i]._method;
                delete conf[i]._package;
                delete conf[i]._routePath;
                delete conf[i]._debug;
            }

            ComponentFileContentMapFilesX[i] = conf[i];
            if (fs.existsSync(sassPath)) {
                SassFileContent += `.${name}\n`;
                SassFileContent += `    @import "${sassPath.replace(/\\/g, "/")}";\n`;
            }
        }
    }

    if(production) {
        Object.entries(namespace).map(function ([namespace, entries]) {
            ComponentFileContent += "export const " + namespace + "_export = () => Promise.all([ \t\n" + entries.map(entry => "import( /* webpackChunkName: \"" + namespace + "_ns\" */   '" + entry + "')").join(",\t\n") + "\n\t]);";
        });
    }

    ComponentFileContent += `\nexport const ViewFileMap = ${JSON.stringify(ComponentFileContentMapFilesX, null, 2)} ;`;
    fs.writeFileSync(SAVE_COMPONENT_TARGET, ComponentFileContent);
    fs.writeFileSync(SAVE_SASS_TARGET, SassFileContent);
};

module.exports = extractor;
