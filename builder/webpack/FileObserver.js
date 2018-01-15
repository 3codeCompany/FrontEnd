var chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

var setupFileObserver = function (BASE_PATH, SAVE_COMPONENT_TARGET, SAVE_SASS_TARGET) {


    let routeFile = path.resolve(BASE_PATH + '/data/cache/symfony/');

    let newRoutingStr = "";

    fs.access(routeFile, fs.constants.R_OK, (err) => {
        console.log(err ? 'no access!' : 'can read/write');
        let size = 0;
        if (!err) {

            chokidar.watch(routeFile, {awaitWriteFinish: true}).on('change', (path, details) => {
                if (path.indexOf == undefined) {
                    console.log(path);
                }
                if (path && path.indexOf && path.indexOf("route.json") != -1) {
                    if (details.size != size) {
                        size = details.size;
                        let conf = require(routeFile + "/route.json");
                        let ComponentFileContent = "";
                        let ComponentFileContentMapFilesX = {};
                        for (i in conf) {

                            let componentPath = BASE_PATH + conf[i]._debug.template + ".component.tsx";

                            if (fs.existsSync(componentPath)) {
                                let name = i.replace("/", "").replace(/\//g, "_");
                                ComponentFileContent += 'import ' + name + ' from \'' + componentPath.replace(/\\/g, '/') + '\';\n';
                                ComponentFileContent += ' export { ' + name + '}; \n';
                                ComponentFileContentMapFilesX[i] = conf[i];
                            } else {
                                let componentPath = BASE_PATH + conf[i]._debug.template + ".component.tsx";
                                console.log(componentPath, "not found");
                            }
                        }

                        ComponentFileContent += `\nexport const ViewFileMap = ${JSON.stringify(ComponentFileContentMapFilesX)} ;`;
                        fs.writeFile(SAVE_COMPONENT_TARGET.replace("components.include", "components-route.include"), ComponentFileContent, function (err) {
                            if (err) {
                                return console.log(err);
                            } else {
                                console.log('The file was saved!');
                            }
                        });


                    }
                }
            });
        }
    });


    let watchedDirs = [
        {package: 'app', dir: BASE_PATH + '/application/views'},
        {package: 'app', dir: BASE_PATH + '/app/views'},
        {package: 'access', dir: BASE_PATH + '/vendor/arrow/engine/src/packages/access/views'},
        {package: 'translations', dir: BASE_PATH + '/vendor/arrow/engine/src/packages/translations/views'},
        {package: 'utils', dir: BASE_PATH + '/vendor/arrow/engine/src/packages/utils/views'},
    ];


    var walk = function (dir) {
        var components = [];
        var sass = [];
        if (fs.existsSync(dir)) {
            var list = fs.readdirSync(dir);
            list.forEach(function (file) {
                file = dir + '/' + file;
                var stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    let [c, s] = walk(file);
                    components = components.concat(c);
                    sass = sass.concat(s);
                } else {
                    if (file.match(/.*\.component\.js$/) || file.match(/.*\.component\.tsx$/)) {
                        components.push(file);
                    } else if (file.match(/.*\.component\.sass$/)) {
                        sass.push(file);
                    }
                }
            });
        }

        return [components, sass];
    };


    const linkArrowDir = () => {
        let ComponentFileContent = '';
        let ComponentFileContentEx = [];
        let ComponentFileContentMapFiles = {};
        let SassFileContent = '';
        watchedDirs.map(config => {
            let [components, sass] = walk(config.dir);
            components.forEach((entry) => {
                let name = entry.replace(config.dir + '/', '');
                name = name.replace(/\//g, '_');
                name = name.replace('.component.js', '');
                name = name.replace('.component.tsx', '');
                name = config.package + '_' + name;
                let data = {file: entry}

                ComponentFileContent += 'import ' + name + ' from \'' + entry.replace(/\\/g, '/') + '\';\n';
                //ComponentFileContent += `export ${name};\n`;
                ComponentFileContentMapFiles[name] = entry.replace(/\\/g, '/');
                ComponentFileContentEx.push(name)
            });
            sass.forEach((entry) => {
                let name = entry.replace(config.dir + '/', '');
                name = name.replace(/\//g, '_');
                name = name.replace('.component.sass', '');
                name = config.package + '_' + name;
                SassFileContent += `.${name}\n`;
                SassFileContent += `    @import "${entry.replace(/\\/g, "/")}";\n`;

            });


        });
        ComponentFileContent += `\nexport{ ${ComponentFileContentEx.join(",")} };`;
        ComponentFileContent += `\nexport const ViewFileMap = ${JSON.stringify(ComponentFileContentMapFiles)} ;`;


        fs.writeFile(SAVE_COMPONENT_TARGET, ComponentFileContent, function (err) {
            if (err) {
                return console.log(err);
            } else {
                console.log('The file was saved!');
            }
        });
        fs.writeFile(SAVE_SASS_TARGET, SassFileContent, function (err) {
            if (err) {
                return console.log(err);
            } else {
                console.log('The file was saved!');
            }
        });
    };

    linkArrowDir();


    let dirs = watchedDirs.reduce((p, c) => {
        p.push(c.dir);
        return p;
    }, []);


    chokidar.watch(
        dirs,
        {
            ignored: /(^|[\/\\])\../,
            ignoreInitial: true

        })
        .on('add', (event, path) => {
            console.log(event, path);
            linkArrowDir();
        })
        .on('unlink', (event, path) => {
            console.log(event, path);
            linkArrowDir();
        });

}


module.exports = setupFileObserver;
