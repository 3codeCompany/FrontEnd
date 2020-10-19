import * as React from "react";
import { BackofficeStore, IDebugDataEntry } from "./BackofficeStore";
import { useEffect, useState } from "react";
import { ideConnector } from "./IDEConnector";
import { LoadingIndicator } from "../LoadingIndicator";
import { PrintJSON } from "../PrintJSON";

import styles from "./DebugCommLog.module.sass";

import { Modal } from "../Modal";

export default () => {


    const [log, setLog] = useState([...BackofficeStore.debugLog].reverse());
    const [inspectingValue, setInspectingValue] = useState(null);
    const [isExpanded, setExpanded] = useState(true);

    useEffect(() => {
        BackofficeStore.registerDebugDataListener((log: IDebugDataEntry[]) => {
            const target = [...log];
            target.reverse();
            setLog(target);
        });
    }, []);

    return (
        <div className={styles.container + " " + (!isExpanded && styles.hidden)}>
            <div className={styles.title}>
                <span>Comm Log</span>
                <a
                    onClick={() => {
                        setExpanded(!isExpanded);
                    }}
                >
                    {isExpanded ? "hide" : "show"}
                </a>
                {isExpanded && (
                    <a
                        onClick={() => {
                            BackofficeStore.cleanUpDebugData();
                        }}
                    >
                        clear
                    </a>
                )}
            </div>

            {isExpanded && (
                <table>
                    <thead>
                        <tr>
                            <th>time</th>
                            <th>route</th>
                            <th>url</th>
                            <th>type</th>
                            <th>response</th>
                            <th>input</th>
                        </tr>
                    </thead>
                    <tbody>
                        {log.map((el, index) => (
                            <RouteInfo key={el.url + el.time + index} info={el} setInspectingValue={setInspectingValue} />
                        ))}
                    </tbody>
                </table>
            )}
            {inspectingValue !== null && (
                <Modal show={true} onHide={() => setInspectingValue(null)} title="Inspecting">
                    <div className={"w-debug-comm-log-inspect"}>
                        <PrintJSON json={inspectingValue} />
                    </div>
                </Modal>
            )}
        </div>
    );
};

const RouteInfo = ({
    info,
    setInspectingValue,
}: {
    info: IDebugDataEntry;
    setInspectingValue: (value: string) => any;
}) => {

    const [doing, setDoing] = useState("");

    const [isConnectingWithIDE, setIsConnectingWithIDE] = useState("");

    const routeInfoClicked = (file: string, line: number) => {
        ideConnector.openFile(file, line, (devResponse) => {
            if (devResponse.status == "OK") {
                setIsConnectingWithIDE("Opened");
                setTimeout(() => setIsConnectingWithIDE(""), 100);
            } else {
                setTimeout(() => setIsConnectingWithIDE("Error: " + devResponse.error), 100);
            }
        });
    };

    const t = info.time;

    let tmpResponse = info.response;
    if (typeof tmpResponse == "string") {
        try {
            tmpResponse = JSON.parse(tmpResponse);
            tmpResponse = Object.keys(tmpResponse).length + " keys";
        } catch (e) {
            tmpResponse = "string:" + tmpResponse.length + " length";
        }
    } else {
        tmpResponse = Object.keys(tmpResponse).length + " keys";
    }

    return (
        <tr>
            <td>
                {t.getHours() +
                    ":" +
                    (t.getMinutes() < 10 ? "0" : "") +
                    t.getMinutes() +
                    ":" +
                    (t.getSeconds() < 10 ? "0" : "") +
                    t.getSeconds()}
            </td>
            <td>{info.routeInfo.routePath}</td>
            <td>
                <a href={info.url} target={"_blank"}>
                    {info.url}
                </a>
            </td>
            <td>{info.requestType}</td>
            <td>
                <a
                    onClick={() => {
                        if (tmpResponse.indexOf("keys") != -1) {
                            setInspectingValue(JSON.parse(info.response));
                        }
                    }}
                >
                    {tmpResponse}
                </a>{" "}
            </td>
            <td>
                <a onClick={() => setInspectingValue(info.input)}>{Object.keys(info.input).length} keys</a>
            </td>
            <td>
                {info.requestType == "view" && (
                    <a onClick={() => routeInfoClicked(info.routeInfo._debug.template + ".component.tsx", 1)}>
                        go to view
                    </a>
                )}
            </td>
            <td>
                <a onClick={() => routeInfoClicked(info.routeInfo._debug.file, info.routeInfo._debug.line)}>
                    go to code
                </a>
            </td>
            <td>
                <a onClick={() => ideConnector.createURLFile(info.url, info.input)}>create ide request</a>
            </td>

            <td>{isConnectingWithIDE}</td>
        </tr>
    );
};
