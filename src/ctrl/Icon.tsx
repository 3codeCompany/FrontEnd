import * as React from "react";


interface IIconProps {
    name: string;
    size?: number

}

const Icon: React.StatelessComponent<IIconProps> = (props) => {
    let add: any = {};
    if (props.size != undefined) {
        add = {style: {fontSize: props.size}};
    }
    return (
        <i className={"ms-Icon ms-Icon--" + props.name} {...add} aria-hidden="true"/>
    );
};

export default Icon;
export {Icon}
