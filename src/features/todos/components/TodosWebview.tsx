import { Component, createRef, ReactElement, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import withStyles, { WithStylesProps } from 'react-jss';
import Webview from 'react-electron-web-view';
import classnames from 'classnames';
import { TODOS_PARTITION_ID } from '../../../config';
import { TodoClientMessage } from '../actions';

const styles = theme => ({
  root: {
    background: theme.colorBackground,
    position: 'relative',
    borderLeft: [1, 'solid', theme.todos.todosLayer.borderLeftColor],
    zIndex: 300,

    transform: ({ isVisible, width, isTodosServiceActive }) =>
      `translateX(${isVisible || isTodosServiceActive ? 0 : width}px)`,

    '& webview': {
      height: '100%',
    },
  },
  resizeHandler: {
    position: 'absolute',
    left: 0,
    marginLeft: -5,
    width: 10,
    zIndex: 400,
    cursor: 'col-resize',
  },
  dragIndicator: {
    position: 'absolute',
    left: 0,
    width: 5,
    zIndex: 400,
    background: theme.todos.dragIndicator.background,
  },
  isTodosServiceActive: {
    width: 'calc(100% - 368px)',
    position: 'absolute',
    right: 0,
    zIndex: 0,
    borderLeftWidth: 0,
  },
  hidden: {
    borderLeftWidth: 0,
  },
});

interface IProps extends WithStylesProps<typeof styles> {
  isTodosServiceActive: boolean;
  isVisible: boolean;
  handleClientMessage: (channel: string, message: TodoClientMessage) => void;
  setTodosWebview: (webView: Webview) => void;
  resize: (newWidth: number) => void;
  width: number;
  minWidth: number;
  userAgent: string;
  todoUrl: string;
  isTodoUrlValid: boolean;
}

interface IState {
  isDragging: boolean;
  width: number;
  initialPos: number;
  delta: number;
}

@observer
class TodosWebview extends Component<IProps, IState> {
  private node = createRef<HTMLDivElement>();

  private webview: Webview;

  constructor(props: IProps) {
    super(props);

    this.state = {
      isDragging: false,
      width: 300,
      initialPos: 0,
      delta: 0,
    };
    this.resizePanel = this.resizePanel.bind(this);
    this.stopResize = this.stopResize.bind(this);
  }

  componentDidMount() {
    this.setState({
      width: this.props.width,
    });

    if (this.node.current) {
      this.node.current.addEventListener('mousemove', this.resizePanel);
      this.node.current.addEventListener('mouseup', this.stopResize);
      this.node.current.addEventListener('mouseleave', this.stopResize);
    }
  }

  startResize = (e: MouseEvent<HTMLDivElement>): void => {
    this.setState({
      isDragging: true,
      initialPos: e.clientX,
      delta: 0,
    });
  };

  resizePanel = (e: MouseEventInit): void => {
    const { minWidth } = this.props;
    const { isDragging, initialPos } = this.state;

    if (isDragging && Math.abs(e.clientX! - window.innerWidth) > minWidth) {
      const delta = e.clientX! - initialPos;

      this.setState({
        delta,
      });
    }
  };

  stopResize = (): void => {
    const { resize, minWidth } = this.props;
    const { isDragging, delta, width } = this.state;

    if (isDragging) {
      let newWidth = width + (delta < 0 ? Math.abs(delta) : -Math.abs(delta));

      if (newWidth < minWidth) {
        newWidth = minWidth;
      }

      this.setState({
        isDragging: false,
        delta: 0,
        width: newWidth,
      });

      resize(newWidth);
    }
  };

  startListeningToIpcMessages = (): void => {
    if (!this.webview) {
      return;
    }

    const { handleClientMessage } = this.props;
    this.webview.addEventListener('ipc-message', e => {
      handleClientMessage(e.channel, e.args[0]);
    });
  };

  render(): ReactElement {
    const {
      classes,
      isTodosServiceActive,
      isVisible,
      userAgent,
      todoUrl,
      isTodoUrlValid,
    } = this.props;

    const { width, delta, isDragging } = this.state;
    let displayedWidth = isVisible ? width : 0;
    if (isTodosServiceActive) {
      displayedWidth = 0;
    }

    return (
      <div
        className={classnames({
          [classes.root]: true,
          [classes.isTodosServiceActive]: isTodosServiceActive,
          'todos__todos-panel--expanded': isTodosServiceActive,
          [classes.hidden]: !isVisible,
        })}
        style={{ width: displayedWidth }}
        onMouseUp={() => this.stopResize()}
        ref={this.node}
        id="todos-panel"
      >
        <div
          className={classes.resizeHandler}
          style={{
            left: delta,
            ...(isDragging ? { width: 600, marginLeft: -200 } : {}),
          }} // This hack is required as resizing with webviews beneath behaves quite bad
          onMouseDown={this.startResize}
        />
        {isDragging && (
          <div
            className={classes.dragIndicator}
            style={{ left: delta }} // This hack is required as resizing with webviews beneath behaves quite bad
          />
        )}
        {isTodoUrlValid && (
          <Webview
            // className={classes.webview} // TODO: [TS DEBT] style not found
            onDidAttach={() => {
              const { setTodosWebview } = this.props;
              setTodosWebview(this.webview);
              this.startListeningToIpcMessages();
            }}
            partition={TODOS_PARTITION_ID}
            preload="./features/todos/preload.js"
            ref={webview => {
              this.webview = webview ? webview.view : null;
            }}
            useragent={userAgent}
            src={todoUrl}
            allowpopups
          />
        )}
      </div>
    );
  }
}

export default withStyles(styles, { injectTheme: true })(TodosWebview);
