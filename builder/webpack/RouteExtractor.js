var exec = require("child_process").exec;
const fs = require("fs");
const path = require("path");
let routeEqualizer = "";

const extractor = function(inputExtractor, basePath, targetComponentFile, targetSassFile, production = false) {
    production = false;

    console.log("Route check ...");
    inputExtractor.then((route) => {
        try {

            const routeSimplyfied = Object.entries(route).map(([index, el]) => [
                el.controller,
                el.method,
                el.routePath,
                el.package,
                el._debug.templateExists,
                el._debug.componentExists,
            ]);
            const toEqual = JSON.stringify(routeSimplyfied);
            if (toEqual != routeEqualizer) {
                routeEqualizer = toEqual;
                generateRouteAssetsFromJson(route, targetComponentFile, targetSassFile, basePath, production);
            } else {
                console.log("No changes");
            }
        } catch (e) {
            console.log("Routes extract problem");
            console.log(stdout);
            console.log("------------------");
            console.log(basePath + "/" + command);

            throw "Can't extract routes. Error: " + e.message;
        }

    });
};

generateRouteAssetsFromJson = function(conf, SAVE_COMPONENT_TARGET, SAVE_SASS_TARGET, BASE_PATH, production) {
    let ComponentFileContent = "";
    let ComponentFileContentMapFilesX = {};
    let SassFileContent = "";


    let namespace = {};

    for (i in conf) {
        let componentPath =
            BASE_PATH + (conf[i]._debug.template[0] == "/" ? "" : "/") + conf[i]._debug.template + ".component.tsx";
        let sassPath = BASE_PATH + conf[i]._debug.template + ".component.sass";

        if (conf[i]._debug.componentExists) {
            let name = ( conf[i].routePath)
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
                //ComponentFileContent += " export { " + name + "}; \n";
            }


            conf[i].component = "||" + name + "||";
            conf[i].componentName = name;
            conf[i].index = namespace[tmpNamespace].length - 1;
            conf[i].namespace = tmpNamespace;

            if (production) {
                delete conf[i]._controller;
                delete conf[i]._method;
                delete conf[i]._package;
                delete conf[i]._routePath;
                delete conf[i]._debug;
            }

            if (fs.existsSync(sassPath)) {
                SassFileContent += `.${name}\n`;
                SassFileContent += `    @import "${sassPath.replace(/\\/g, "/")}";\n`;
            }
        }

        ComponentFileContentMapFilesX[i] = conf[i];
    }

    if (production) {
        Object.entries(namespace).map(function([namespace, entries]) {
            ComponentFileContent +=
                "export const " +
                namespace +
                "_export = () => Promise.all([ \t\n" +
                entries
                    .map((entry) => "import( /* webpackChunkName: \"" + namespace + "_ns\" */   '" + entry + "')")
                    .join(",\t\n") +
                "\n\t]);";
        });
    }

    let txt = JSON.stringify(Object.values(ComponentFileContentMapFilesX), null, 2);
    txt = txt.replace(/\|\|\"/g, "").replace(/\"\|\|/g, "");
    ComponentFileContent += `\nexport const ViewFileMap = ${txt} ;`;
    fs.writeFileSync(SAVE_COMPONENT_TARGET, ComponentFileContent);
    fs.writeFileSync(SAVE_SASS_TARGET, SassFileContent);
};

module.exports = extractor;
