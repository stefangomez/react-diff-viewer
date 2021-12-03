require('./style.scss');
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ReactDiff, { DiffMethod } from '../../lib/index';

const oldJs = require('./diff/javascript/old.rjs').default;
const newJs = require('./diff/javascript/new.rjs').default;
let lineId = 0;
let prefix = 'L';
let firstAssign = true;
let clickedLines: string[] = [];

const logo = require('../../logo.png');

interface ExampleState {
  splitView?: boolean;
  highlightLine?: string[];
  language?: string;
  enableSyntaxHighlighting?: boolean;
  compareMethod?: DiffMethod;
  newtxt?: string[];
  oldtxt?: string[];
  clickedLines?: string[];
}

const P = (window as any).Prism;

// const utilizeFocus = () => {
//   const ref:React.Ref<any> = React.createRef();
//   const setFocus = () => {ref.current &&  ref.current.focus()}

//   return {setFocus, ref} 
// }

class Example extends React.Component<{}, ExampleState> {
  contentRef: Object;

  public constructor(props: any) {
    super(props);
    const newtxt = newJs.split('\n');
    const oldtxt = oldJs.split('\n');
    this.state = {
      highlightLine: [],
      enableSyntaxHighlighting: true,
      newtxt: newtxt,
      oldtxt: oldtxt,
      clickedLines: []
    };
    this.contentRef = React.createRef();
  }

  private onLineNumberClick = (
    id: string,
    e: React.MouseEvent<HTMLTableCellElement>,
  ): void => {
    let highlightLine = [id];
    if (e.shiftKey && this.state.highlightLine.length === 1) {
      const [dir, oldId] = this.state.highlightLine[0].split('-');
      const [newDir, newId] = id.split('-');
      if (dir === newDir) {
        highlightLine = [];
        const lowEnd = Math.min(Number(oldId), Number(newId));
        const highEnd = Math.max(Number(oldId), Number(newId));
        for (let i = lowEnd; i <= highEnd; i++) {
          highlightLine.push(`${dir}-${i}`);
        }
      }
    }
    this.setState({
      highlightLine,
    });
  };

  private saveContent = (
    id: string,
    e: React.FormEvent<HTMLTableCellElement>,
  ): void => {

    console.log("bang: ", e);
  };

  private onContentClick = (
    id: string,
    e: React.MouseEvent<HTMLTableCellElement>,
  ): void => 
  {
    firstAssign = true;
    if (clickedLines.includes(id)) {
      //keeping the last line clicked at the first index of the array
      clickedLines = clickedLines.filter(e => e !== id);
    } 
    clickedLines.unshift(id);
    // this.setState({ clickedLines });
    console.log("onContentClick - clicked lines: ", clickedLines);
  };

  private keyd = (
    id: string,
    e: React.KeyboardEvent<HTMLTableCellElement>,
  ): void => {
    
    let toAdd:number;
    const {oldtxt, newtxt} = this.state;
    const line_ = parseInt(clickedLines[0].split('-')[1]); //TODO TO SUPPRESS lineNb
    console.log("keyd - clickedLines[0]", clickedLines[0], "line_: ", line_);
    let isUp = false;
    if(e.key === 'ArrowUp' || e.key === 'ArrowDown')
    {
      if(firstAssign)
      {
        prefix = id.split('-')[0];
        let lineNb = parseInt(id.split('-')[1]);
        console.log("keyd - pref: ", prefix, "lineNb: ", lineNb);
        firstAssign = false;
        lineId = line_;
      }
      toAdd = 1;
      if (e.key === 'ArrowUp')
      {
        isUp = true;
        toAdd = -1;
      }
      lineId = lineId + toAdd;
      lineId = lineId === 0 ? 1 : lineId ;
      const source = prefix === 'L' ? oldtxt : newtxt;
      console.log("nb: ", lineId, "line: ", source[lineId-1]);
    }
    console.log("key: ", e);
    const content = document.getElementsByClassName('css-vl0irh-content');
    let tempLineId = lineId*2;
    while(content[tempLineId-1].classList.contains("css-1yptt6o-empty-line"))
    {
      if (isUp)
      {
        tempLineId -= 2;
      }
      else{
        tempLineId += 2;
      }
    }
    console.log(content[tempLineId-1]);
    const contentRef = `${prefix}-${lineId}`;
    content[tempLineId-1].setAttribute('id', contentRef);
    lineId = tempLineId/2;
    document.getElementById(contentRef).focus();
    // console.log('typeof createref : ', typeof(React.createRef()));
  };

  private syntaxHighlight = (str: string): any => {
    if (!str) return;
    const language = P.highlight(str, P.languages.javascript);
    return <span dangerouslySetInnerHTML={{ __html: language }} />;
  };

  public render(): JSX.Element {

    return (
      <div className="react-diff-viewer-example">
        <div className="radial"></div>
        <div className="banner">
          <div className="img-container">
            <img src={logo} alt="React Diff Viewer Logo" />
          </div>
          <p>
            A simple and beautiful text diff viewer made with{' '}
            <a href="https://github.com/kpdecker/jsdiff" target="_blank">
              Diff{' '}
            </a>
            and{' '}
            <a href="https://reactjs.org" target="_blank">
              React.{' '}
            </a>
            Featuring split view, inline view, word diff, line highlight and more.
          </p>
          <div className="cta">
            <a href="https://github.com/praneshr/react-diff-viewer#install">
              <button type="button" className="btn btn-primary btn-lg">
                Documentation
              </button>
            </a>
          </div>
        </div>
        <div className="diff-viewer">
          <ReactDiff
            highlightLines={this.state.highlightLine}
            onLineNumberClick={this.onLineNumberClick}
            onContentChange={this.saveContent}
            onKeyDown={this.keyd}
            oldValue={oldJs}
            onContentSelect={this.onContentClick}
            splitView
            newValue={newJs}
            renderContent={this.syntaxHighlight}
            useDarkTheme
            leftTitle="webpack.config.js master@2178133 - pushed 2 hours ago."
            rightTitle="webpack.config.js master@64207ee - pushed 13 hours ago."
            showDiffOnly={false}
          />
        </div>
        <footer>
          Made with 💓 by{' '}
          <a href="https://praneshravi.in" target="_blank">
            Pranesh Ravi
          </a>
        </footer>
      </div>
    );
  }
}

ReactDOM.render(<Example />, document.getElementById('app'));
