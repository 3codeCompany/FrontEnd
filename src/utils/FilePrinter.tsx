import {IFile} from "./FileLists";

export const printFile = ( file: IFile ) => {

    const pwin = window.open(file.path, "_blank");

    pwin.onload = function() {
        pwin.focus();
        pwin.print();

        setTimeout(pwin.close, 0);
    };

};



export const printFileFromURL = ( url: string ) => {

    const pwin = window.open(url, "_blank");

    pwin.onload = function() {
        pwin.focus();
        pwin.print();

        setTimeout(pwin.close, 0);
    };

};

