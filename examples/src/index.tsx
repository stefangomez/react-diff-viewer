require('./style.scss');
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ReactDiff, { DiffMethod } from '../../lib/index';

const oldJs = require('./diff/javascript/old.rjs').default;
const newJs = require('./diff/javascript/new.rjs').default;
let lineId = 0;
let prefix = 'L';
let clickedLines: string[] = [];
const newtxt = newJs.split('\n');
const oldtxt = oldJs.split('\n');
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

class Example extends React.Component<{}, ExampleState> {
  contentRef: Object;
  isChange: boolean;
  isEnter: boolean;
  timerID: number;
  changedLines: string[];

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  public constructor(props: any) {
    super(props);
    this.isChange = false;
    this.state = {
      highlightLine: [],
      enableSyntaxHighlighting: true,
      newtxt: newtxt,
      oldtxt: oldtxt,
      clickedLines: []
    };
    this.contentRef = React.createRef();
    this.isEnter = false;
    this.changedLines = [];
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

  private onContentClick = (
    id: string,
    e: React.MouseEvent<HTMLTableCellElement>,
  ): void => 
  {
    if (clickedLines.includes(id)) {
      //keeping the last line clicked at the first index of the array
      clickedLines = clickedLines.filter(el => el !== id);
    } 
    clickedLines.unshift(id);
    prefix = id.split('-')[0];
    lineId = parseInt(id.split('-')[1]);
    console.log("onContentClick - clicked lines: ", clickedLines);
  };

  // TODO : do not overwrite the already set ids..
  private keyd = (
    id: string,
    e: React.KeyboardEvent<HTMLTableCellElement>,
  ): void => {
    let toAdd:number;
    const {oldtxt, newtxt} = this.state;
    const line_ = parseInt(clickedLines[0].split('-')[1]);
    console.log("keyd - clickedLines[0]", clickedLines[0], "line_: ", line_);
    let isUp = false;
    console.log("key: ", e);
    if(e.key === 'ArrowUp' || e.key === 'ArrowDown')
    {
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
      const content = document.getElementsByClassName('css-vl0irh-content');
      const contentRef = `${prefix}-${lineId}`;
      document.getElementById(contentRef).focus();
      console.log("======================");
    }
    else if(e.key === "Enter")
    {
      this.isEnter = true;      
    }
  };

  private onContentBlur = (
    id: string,
    e: React.FocusEvent<HTMLTableCellElement>,
  ): void => 
  {
    if (this.isChange)
    {
      this.isChange = false;
      console.log("blur - id: ",id," event: ", e);
      const content = document.getElementById(id);
      const pref = id.split('-')[0];
      const lineNb = parseInt(id.split('-')[1]);
      if (pref === 'L')
      {
        const contentText = content.innerText;
        // if (contentText.includes('\n'))
        if (this.isEnter)
        {
          this.isEnter = false;
          const contentTextArr = contentText.split("\n");
          console.log("innert: ", contentTextArr);
          oldtxt.splice(lineNb-1, 1, ...contentTextArr);
          console.log("newcc: ", oldtxt);
        }
        else{
          oldtxt[lineNb-1] = contentText;
        }
        this.setState({oldtxt});
      }
      else
      {
        let uu =8;
        uu++;
      }
    }
    
  }

  private onContentChange = (
    id: string,
    e: React.FormEvent<HTMLTableCellElement>,
  ): void => {
    this.isChange = true;
    console.log("bang: ", e);
    if (!this.changedLines.includes(id))
    {
      this.changedLines.push(id);
    }
  }

  // private saveContent = (): void => 
  // {
  //   if (this.isChange)
  //   {
  //     this.isChange = false;
  //     console.log("changedlines: ", this.changedLines);
  //     this.changedLines.forEach(lineRef => {
  //       const content = document.getElementById(lineRef);
  //       const pref = lineRef.split('-')[0];
  //       const lineNb = parseInt(lineRef.split('-')[1]);
  //       if (pref === 'L')
  //       {
  //         const contentText = content.innerText;
  //         if (contentText.includes('\n'))
  //         {
  //           const contentTextArr = contentText.split("\n");
  //           console.log("innert: ", contentTextArr);
  //           oldtxt.splice(lineNb-1, 1, ...contentTextArr);
  //           console.log("newcc: ", oldtxt);
  //         }
  //         else{
  //           oldtxt[lineNb-1] = contentText;
  //         }
  //         this.setState({oldtxt});
  //       }
  //       else
  //       {
  //         let uu =8;
  //         uu++;
  //       }
  //     });
      
  //     this.changedLines = [];
  //     if(this.isEnter)
  //     {
  //       this.isEnter = false;
  //       const contentRef = `${prefix}-${lineId}`;
  //       console.log("contentreffff: ", contentRef);
  //       let content = document.getElementById(contentRef);
        
  //     }
  //   }
  // };



  
  
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
            onContentChange={this.onContentChange}
            onKeyDown={this.keyd}
            // oldValue={oldJs}
            oldValue={this.state.oldtxt.join("\n")}
            onContentSelect={this.onContentClick}
            onContentBlur={this.onContentBlur}
            splitView
            newValue={this.state.newtxt.join("\n")}
            // newValue={newJs}
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
