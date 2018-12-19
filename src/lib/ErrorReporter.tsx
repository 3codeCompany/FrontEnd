import * as React from "react";
//var sourceMap = require('source-map');
import {SourceMapConsumer} from 'source-map/dist/source-map.min.js';
import { ideConnector } from "../dev/IDEConnector";

export default class ErrorReporter extends React.Component<any,any> {

    constructor(props) {
        super(props);
        this.state = {
            file: [],
            stacks: []
        };

    }

    componentDidMount() {


        let e = this.props.error;


        let stacks = parseError(e.stack);
        fetch(window.location.protocol + '//localhost:3000/bundle.js.map', {
            method: 'get'
        }).then((response) => {
              response.text().then((rawSourceMapJsonData) => {

                    var consumer = new SourceMapConsumer(rawSourceMapJsonData);
                    stacks.forEach(stack => {
                        this.state.stacks.push(consumer.originalPositionFor({line: stack.lineNumber, column: stack.columnNumber}));
                    });

                    fetch(window.location.protocol + '//localhost:3000/debug/getFile?file=' + this.state.stacks[0].source, {
                        method: 'get'
                    }).then((response) => {
                        response.text().then((text) => {
                            let lines = text.split('\n');
                            let line = this.state.stacks[0].line;
                            let presented = [];
                            for (let i = line - 5; i <= line + 5; i++) {
                                presented.push({line: i + 1, content: lines[i]});
                            }

                            this.setState({file: presented});
                            this.forceUpdate();
                        });


                    }).catch(function (err) {
                        alert('Server get file error');
                    });

                }
              );
          }
        );

        return;
    }


    render() {

        if (this.state.stacks.length == 0) {
            return <i className="fa fa-spinner fa-spin"></i>;
        }

        let e = this.props.error;
        let message = e.stack.split('\n')[0];

        let containerCss = {backgroundColor: 'white', padding: 5, margin: 5, border: 'solid 1px grey'};
        let messageCss = {color: 'darkred', marginTop: 5};
        let codeCss:any = {whiteSpace: 'pre', backgroundColor: '#FDF3F4', color: 'black', padding: 5, width: '100%', overflow: 'auto'};


        let line = this.state.stacks[0].line;


        return <div style={containerCss}>
            <h3 style={messageCss}>{message}</h3>
            {/*<h4 style={{color: 'black'}}>{currentMethod}()</h4>*/}
            <div style={codeCss}>
                {this.state.file.map( (el,index) => {
                    if (el.line == line) {
                        return <div style={{backgroundColor: '#FCCFCF'}} key={index}>
                            <div style={{display: 'inline-block', width: 30}}>{el.line} |</div>
                            {el.content}</div>;
                    } else {
                        return <div style={{backgroundColor: ''}}  key={index}>
                            <div style={{display: 'inline-block', width: 30}}>{el.line} |</div>
                            {el.content}</div>;
                    }

                })}
            </div>
            <h4>
                <a onClick={() => ideConnector.openFile(this.state.stacks[0].source, this.state.stacks[0].line)}>{this.state.stacks[0].source}:{this.state.stacks[0].line}</a>
            </h4>
            {this.state.stacks.map( (e, index) => <div key={index}>
                <a  style={{color: 'black'}} onClick={() => ideConnector.openFile(e.source, e.line)}>{e.source}:{e.line}</a>
            </div>)}

        </div>;
    }
}


const regexValidFrame_Chrome = /^\s*(at|in)\s.+(:\d+)/;
const regexValidFrame_FireFox = /(^|@)\S+:\d+|.+line\s+\d+\s+>\s+(eval|Function).+/;

const regexExtractLocation = /\(?(.+?)(?::(\d+))?(?::(\d+))?\)?$/;

function extractLocation(token) {
    return regexExtractLocation
      .exec(token)
      .slice(1)
      .map(v => {
          const p = Number(v);
          if (!isNaN(p)) {
              return p;
          }
          return v;
      });
}

function parseStack(stack) {
    const frames = stack
      .filter(
        e => regexValidFrame_Chrome.test(e) || regexValidFrame_FireFox.test(e)
      )
      .map(e => {
          if (regexValidFrame_FireFox.test(e)) {
              // Strip eval, we don't care about it
              let isEval = false;
              if (/ > (eval|Function)/.test(e)) {
                  e = e.replace(
                    / line (\d+)(?: > eval line \d+)* > (eval|Function):\d+:\d+/g,
                    ':$1'
                  );
                  isEval = true;
              }
              const data = e.split(/[@]/g);
              const last = data.pop();
              return new StackFrame(
                data.join('@') || (isEval ? 'eval' : null),
                ...extractLocation(last)
              );
          } else {
              // Strip eval, we don't care about it
              if (e.indexOf('(eval ') !== -1) {
                  e = e.replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
              }
              if (e.indexOf('(at ') !== -1) {
                  e = e.replace(/\(at /, '(');
              }
              const data = e
                .trim()
                .split(/\s+/g)
                .slice(1);
              const last = data.pop();
              return new StackFrame(data.join(' ') || null, ...extractLocation(last));
          }
      });
    return frames;
}

function parseError(error) {
    if (error == null) {
        throw new Error('You cannot pass a null object.');
    }
    if (typeof error === 'string') {
        return parseStack(error.split('\n'));
    }
    if (Array.isArray(error)) {
        return parseStack(error);
    }
    if (typeof error.stack === 'string') {
        return parseStack(error.stack.split('\n'));
    }
    throw new Error('The error you provided does not contain a stack trace.');
}

class ScriptLine {
    /** The line number of this line of source. */
    lineNumber;
    /** The content (or value) of this line of source. */
    content;
    /** Whether or not this line should be highlighted. Particularly useful for error reporting with context. */
    highlight;

    constructor(lineNumber, content, highlight = false) {
        this.lineNumber = lineNumber;
        this.content = content;
        this.highlight = highlight;
    }
}

/**
 * A representation of a stack frame.
 */
class StackFrame {
    functionName;
    fileName;
    lineNumber;
    columnNumber;

    _originalFunctionName;
    _originalFileName;
    _originalLineNumber;
    _originalColumnNumber;

    _scriptCode;
    _originalScriptCode;

    constructor(functionName = null,
                fileName = null,
                lineNumber = null,
                columnNumber = null,
                scriptCode = null,
                sourceFunctionName = null,
                sourceFileName = null,
                sourceLineNumber = null,
                sourceColumnNumber = null,
                sourceScriptCode = null) {
        if (functionName && functionName.indexOf('Object.') === 0) {
            functionName = functionName.slice('Object.'.length);
        }
        if (
          // Chrome has a bug with inferring function.name:
        // https://github.com/facebookincubator/create-react-app/issues/2097
        // Let's ignore a meaningless name we get for top-level modules.
        functionName === 'friendlySyntaxErrorLabel' ||
        functionName === 'exports.__esModule' ||
        functionName === '<anonymous>' ||
        !functionName
        ) {
            functionName = null;
        }
        this.functionName = functionName;

        this.fileName = fileName;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;

        this._originalFunctionName = sourceFunctionName;
        this._originalFileName = sourceFileName;
        this._originalLineNumber = sourceLineNumber;
        this._originalColumnNumber = sourceColumnNumber;

        this._scriptCode = scriptCode;
        this._originalScriptCode = sourceScriptCode;
    }

    /**
     * Returns the name of this function.
     */
    getFunctionName() {
        return this.functionName || '(anonymous function)';
    }

    /**
     * Returns the source of the frame.
     * This contains the file name, line number, and column number when available.
     */
    getSource() {
        let str = '';
        if (this.fileName != null) {
            str += this.fileName + ':';
        }
        if (this.lineNumber != null) {
            str += this.lineNumber + ':';
        }
        if (this.columnNumber != null) {
            str += this.columnNumber + ':';
        }
        return str.slice(0, -1);
    }

    /**
     * Returns a pretty version of this stack frame.
     */
    toString() {
        const functionName = this.getFunctionName();
        const source = this.getSource();
        return `${functionName}${source ? ` (${source})` : ``}`;
    }
}
