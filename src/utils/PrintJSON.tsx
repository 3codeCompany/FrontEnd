import * as React from "react";

interface IIconProps {
    json: object;
    counter?: number;
}

const PrintJSON: React.StatelessComponent<IIconProps> = (props) => {
    const counter = props.counter || 0;

    let {json} = props;

    if (typeof json === "string") {
        json = JSON.parse(json);
    }

/*    let tdMainStyle: Partial<CSSStyleDeclaration> = {};

    if (counter == 0) {
        tdMainStyle = {verticalAlign: "top", fontWeight: "bold", padding: "10px"};
    }

    if (!Array.isArray(json) && typeof json === "object" && json !== null) {
        return (
            <div className="w-table" onClick={() => console.log(json)}>
                <table style={{width: "100%"}}>
                    <tbody>
                    {Object.entries(json).map(([key, value]) => (
                        <tr key={key}>
                            <td style={tdMainStyle}>{key}</td>
                            <td>
                                <PrintJSON json={value} counter={counter + 1}/>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }*/

    return <pre onClick={() => console.log(json)}>{JSON.stringify(json, null, 2)}</pre>;
};

export default PrintJSON;
export {PrintJSON};
