const path = require("path");
const fs = require("fs");
const https = require("https");
const mkdirp = require("mkdirp");

var getDevServerConf = function (ENTRY_POINTS, PUBLIC_PATH, PATH, BASE_PATH, HTTPS, PORT, DOMAIN, LANGUAGE, webpack) {
    const generateSign = () => {
        const selfsigned = require("selfsigned");
        const attrs = [{name: "commonName", value: "localhost"}];
        const pems = selfsigned.generate(attrs, {
            algorithm: "sha256",
            keySize: 2048,
            extensions: [
                {
                    name: "subjectAltName",
                    altNames: [
                        {
                            type: 2, // DNS
                            value: "localhost",
                        },
                    ],
                    cA: true,
                },
            ],
        });
        if (!fs.existsSync(BASE_PATH + "/build/js/ssl")) {
            fs.mkdirSync(BASE_PATH + "/build/js/ssl");
            fs.writeFileSync(BASE_PATH + "/build/js/ssl/server.crt", pems.cert, {encoding: "utf-8"});
            fs.writeFileSync(BASE_PATH + "/build/js/ssl/server.key", pems.private, {encoding: "utf-8"});
        }
    };

    generateSign();

    conf = {};

    conf.output = {
        filename: "bundle.js",
        publicPath: "http" + (HTTPS ? "s" : "") + `://127.0.0.1:${PORT}/`,
        devtoolModuleFilenameTemplate: function (info) {
            return path.resolve(BASE_PATH, info.absoluteResourcePath).replace(BASE_PATH, "");
        },
    };
    let devEntries = [];

    for (let i in ENTRY_POINTS) {
        devEntries.push(ENTRY_POINTS[i]);
    }

    conf.devServer = {
        //https: HTTPS,
        https: {
            key: fs.readFileSync(BASE_PATH + "/build/js/ssl/server.key"),
            cert: fs.readFileSync(BASE_PATH + "/build/js/ssl/server.crt"),
            //ca: fs.readFileSync("./cert2.pem"),
        },
        //pfx: resolve(__dirname, './cert2.pfx'),
        //pfxPassphrase: 'xxx123',
        hot: true,
        port: PORT,
        publicPath: "http" + (HTTPS ? "s" : "") + `://127.0.0.1:${PORT}/`,
        host: "127.0.0.1",

        stats:
            "minimal" /*{
            colors: true,
            hash: false,
            version: false,
            timings: true,
            assets: false,
            chunks: false,
            modules: false,
            reasons: false,
            children: false,
            source: false,
            errors: true,
            errorDetails: false,
            warnings: false,
            publicPath: false
        },*/,

        disableHostCheck: true,

        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/javascript",
        },

        before: (app) => {
            const busboyBodyParser = require("busboy-body-parser");
            app.use(busboyBodyParser({limit: "5mb", multi: true}));

            app.get("/debug/getFile", function (req, res) {
                res.header("Access-Control-Allow-Origin", "*");
                res.send(fs.readFileSync(BASE_PATH + req.param("file")));
            });
            app.post("/*", function (req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                next();
            });

            app.options("/*", function (req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
                res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
                res.send(200);
            });

            app.post("/createFile", function (req, response) {
                let {file, type} = req.body;
                let dir = path.dirname(BASE_PATH +file);
                if (!fs.existsSync(dir)) {
                    mkdirp.sync(dir);
                }

                if (type == "template") {
                    fs.writeFileSync(BASE_PATH + file, "Automated generated template: " + file);
                } else if (type == "component") {
                    fs.writeFileSync(BASE_PATH + file, fs.readFileSync(path.resolve(__dirname, "../templates/component.tsx")));
                }

                response.send(JSON.stringify({status: "OK"}));
            });

            app.post("/openFile", function (req, response) {
                let {file, line} = req.body;
                console.log("Opening file " + file + ":" + line);
                response.send(JSON.stringify({status: "OK"}));

                var exec = require("child_process").exec;
                //<IDE_HOME>\bin\phpstorm.exe C:\MyProject\ --line 3 C:\MyProject\scripts\numbers.js

                let ideDir, fileTest;
                if (/^win/.test(process.platform)) {
                    ideDir = "C:\\Program Files\\JetBrains\\"; //\\bin\\phpstorm64.exe;
                    fileTest = "\\bin\\phpstorm64.exe";
                } else {
                    ideDir = "/home/artur/dev/PhpStorm-182.3458.35";
                    fileTest = "/bin/phpstorm.sh";
                }

                fs.readdirSync(ideDir).forEach((_file) => {
                    console.log(_file);
                    if (fs.existsSync(ideDir + _file + fileTest)) {
                        let command = `"${ideDir}${_file}${fileTest}" ${BASE_PATH} --line ${line} ${BASE_PATH}${file}`;
                        console.log(command);
                        exec(command, function (error, stdout, stderr) {
                            if (!error) {
                                console.log("worked");
                            } else {
                                console.log("not worked");
                                console.log(stdout);
                                console.log(stderr);
                            }
                        });
                    }
                });

                return;
            });

            app.post("/refreshRoute", function (req, response) {
                response.header("Access-Control-Allow-Origin", "*");
                let routeFile = path.resolve(BASE_PATH + "/data/cache/symfony/route.json");
                let file = fs.writeFileSync(routeFile, req.body.data);

                response.send(JSON.stringify({status: "OK"}));
                return;
            });

            /*app.post('/debug/getRoutes', function (req, res) {
                //let cache = fs.readFileSync(BASE_PATH + "/cache/symfony/route.json");
                let response = {
                    baseDir: BASE_PATH,
                    routes: DOMAIN//JSON.parse(cache)
                }
                res.send(JSON.stringify(response));

            });*/

            /*app.post('/debug/resolveComponent', function (req, res) {
                res.header('Access-Control-Allow-Origin', '*');

                let component = req.body.component;
                let _package = JSON.parse(req.body.packages);

                let exploded = component.split("_");

                let _path = "";
                let firstPart = exploded[0];
                delete(exploded[0]);
                if (_package[firstPart] != undefined) {
                    _path = path.resolve(BASE_PATH + "/" + _package[firstPart] + "/views" + exploded.join("/") + ".component.tsx");
                }
                res.send(JSON.stringify(
                    {
                        path: _path,
                        dir: path.dirname(_path)
                    }
                ));
            });*/
        },
    };
    conf.entry = ENTRY_POINTS;

    conf.plugins = [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        // enable HMR globally

        // prints more readable module names in the browser console on HMR updates

        //new webpack.NoEmitOnErrorsPlugin(),
        // do not emit compiled assets that include errors
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(false),
            LANGUAGE: JSON.stringify(LANGUAGE),
            DEV_PROPERIES: JSON.stringify({
                app_domain: DOMAIN,
                build_domain: JSON.stringify("http" + (HTTPS ? "s" : "") + `://127.0.0.1:${PORT}/`),
                project_dir: BASE_PATH,
            }),

            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
    ];

    return conf;
};

module.exports = getDevServerConf;
