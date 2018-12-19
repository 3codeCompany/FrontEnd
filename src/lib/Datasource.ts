import {Comm} from "frontend/src/lib/Comm";

const isPromise = function (obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

export class Datasource {

    private source: string | Promise<any> | Function;
    private input: any;
    private eventsReady: { (result: any): any }[] = [];
    private filters = {
        map: []
    }


    constructor(source: string | Promise<any> | Function, input = {}) {
        this.source = source;
        this.input = input;
    }

    public static from(source: string | Promise<any> | Function, input = {}) {
        return new Datasource(source, input);
    }

    observe(fn: { (result: any): any }) {
        this.eventsReady.push(fn);
    }

    runReady(result) {
        for (let i = 0; i < this.filters.map.length; i++) {
            result = result.map(this.filters.map[i]);
        }

        for (let i = 0; i < this.eventsReady.length; i++) {
            this.eventsReady[i](result);
        }
    }

    processResult(result) {
        if (typeof result == "function" || isPromise(result) || typeof result == "string") {
            var obj = new Datasource(result, this.input);
            obj.observe((result) => {
                this.runReady(result);
            });
            obj.resolve();
        } else {
            this.runReady(result);
        }
    }

    resolve = () => {
        let result;
        if (typeof this.source == "function") {
            this.processResult(this.source(this.input));
        }
        //check is promise
        if (isPromise(this.source)) {
            (this.source as Promise<any>).then((result) => {
                this.processResult(result);
            })
        }

        if (typeof this.source == "string") {

            Comm._post(this.source, this.input).then((result) => {
                this.processResult(result);
            });
        }
    }

    map(fn: { (result: any): any }) {
        this.filters.map.push(fn);
    }

}
