import Comm from "../lib/Comm";
import { DevProperties } from "./DevProperties";

declare var DEV_PROPERIES: DevProperties;

class IDEConnector {
    public openFile(file, line) {
        const base = Comm.basePath;
        Comm.basePath = "";
        Comm._post(JSON.parse(DEV_PROPERIES.build_domain) + "openFile", { file, line }).then((devResponse) => {
            console.log("Opening file");
        });
        Comm.basePath = base;
    }

    public createComponent(file) {
        const base = Comm.basePath;
        Comm.basePath = "";
        Comm._post(JSON.parse(DEV_PROPERIES.build_domain) + "createFile", { file, type: "component" }).then((devResponse) => {
            console.log("Component created");
        });
        Comm.basePath = base;
    }

    public createTemplate(file) {
        const base = Comm.basePath;
        Comm.basePath = "";
        Comm._post(JSON.parse(DEV_PROPERIES.build_domain) + "createFile", { file, type: "template" }).then((devResponse) => {
            console.log("Template created");
        });
        Comm.basePath = base;
    }

    public refreshRoute() {
        Comm._get("/utils/developer/getRoutes").then((response) => {
            Comm._post(JSON.parse(DEV_PROPERIES.build_domain) + "refreshRoute", { data: JSON.stringify(response) }).then((devResponse) => {
                console.log("Dev response");
            });
        });
    }
}

export const ideConnector = new IDEConnector();
