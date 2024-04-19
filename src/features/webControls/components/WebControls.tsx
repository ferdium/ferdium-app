import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiEarth,
  mdiHomeOutline,
  mdiReload,
} from '@mdi/js';
import { observer } from 'mobx-react';
import { Component, type ReactElement, type RefObject, createRef } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Icon from '../../../components/ui/icon';
import { isEnterKeyPress, isEscapeKeyPress } from '../../../jsUtils';

const messages = defineMessages({
  goHome: {
    id: 'webControls.goHome',
    defaultMessage: 'Home',
  },
  openInBrowser: {
    id: 'webControls.openInBrowser',
    defaultMessage: 'Open in Browser',
  },
  back: {
    id: 'webControls.back',
    defaultMessage: 'Back',
  },
  forward: {
    id: 'webControls.forward',
    defaultMessage: 'Forward',
  },
  reload: {
    id: 'webControls.reload',
    defaultMessage: 'Reload',
  },
});

const buttonTransition = window?.matchMedia(
  '(prefers-reduced-motion: no-preference)',
)
  ? 'opacity 0.25s'
  : 'none';

const styles = theme => ({
  root: {
    background: theme.colorBackground,
    position: 'relative',
    borderLeft: [1, 'solid', theme.todos.todosLayer.borderLeftColor],
    zIndex: 300,
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: [0, 10],

    '& + div': {
      height: 'calc(100% - 50px)',
    },
  },
  button: {
    width: 30,
    height: 50,
    transition: buttonTransition,

    '&:hover': {
      opacity: 0.8,
    },

    '&:disabled': {
      opacity: 0.5,
    },
  },
  icon: {
    width: '20px !important',
    height: 20,
    marginTop: 5,
    color: theme.colorText,
  },
  input: {
    marginBottom: 0,
    height: 'auto',
    margin: [0, 10],
    flex: 1,
    border: 0,
    padding: [4, 10],
    borderRadius: theme.borderRadius,
    background: theme.inputBackground,
    color: theme.inputColor,
  },
  inputButton: {
    color: theme.colorText,
  },
});

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  goHome: () => void;
  canGoBack: boolean;
  goBack: () => void;
  canGoForward: boolean;
  goForward: () => void;
  reload: () => void;
  openInBrowser: () => void;
  url: string;
  navigate: (url: string) => void;
}

interface IState {
  inputUrl: string;
  editUrl: boolean;
}

@observer
class WebControls extends Component<IProps, IState> {
  inputRef: RefObject<HTMLInputElement> = createRef();

  static getDerivedStateFromProps(props, state): IState | null {
    const { url: inputUrl } = props;
    const { editUrl } = state;

    return editUrl ? null : { inputUrl, editUrl };
  }

  constructor(props: IProps) {
    super(props);

    this.state = {
      inputUrl: '',
      editUrl: false,
    };
  }

  render(): ReactElement {
    const {
      classes,
      goHome,
      canGoBack,
      goBack,
      canGoForward,
      goForward,
      reload,
      openInBrowser,
      url,
      navigate,
      intl,
    } = this.props;

    const { inputUrl, editUrl } = this.state;

    return (
      <div className={classes.root}>
        <button
          onClick={goHome}
          type="button"
          className={classes.button}
          data-tooltip-id="tooltip-web-controls"
          data-tooltip-content={intl.formatMessage(messages.goHome)}
          data-place="bottom"
        >
          <Icon icon={mdiHomeOutline} className={classes.icon} />
        </button>
        <button
          onClick={goBack}
          type="button"
          className={classes.button}
          disabled={!canGoBack}
          data-tooltip-id="tooltip-web-controls"
          data-tooltip-content={intl.formatMessage(messages.back)}
          data-place="bottom"
        >
          <Icon icon={mdiArrowLeft} className={classes.icon} />
        </button>
        <button
          onClick={goForward}
          type="button"
          className={classes.button}
          disabled={!canGoForward}
          data-tooltip-id="tooltip-web-controls"
          data-tooltip-content={intl.formatMessage(messages.forward)}
          data-place="bottom"
        >
          <Icon icon={mdiArrowRight} className={classes.icon} />
        </button>
        <button
          onClick={reload}
          type="button"
          className={classes.button}
          data-tooltip-id="tooltip-web-controls"
          data-tooltip-content={intl.formatMessage(messages.reload)}
          data-place="bottom"
        >
          <Icon icon={mdiReload} className={classes.icon} />
        </button>
        <input
          value={editUrl ? inputUrl : url}
          className={classes.input}
          onChange={event =>
            this.setState({
              inputUrl: event.target.value,
            })
          }
          onFocus={event => {
            event.target.select();
            this.setState({
              editUrl: true,
            });
          }}
          onBlur={event => {
            event.target.blur();
            this.setState({
              editUrl: false,
            });
          }}
          onKeyDown={event => {
            if (isEnterKeyPress(event.key)) {
              this.setState({
                editUrl: false,
              });
              navigate(inputUrl);

              if (this.inputRef?.current) {
                this.inputRef.current.blur();
              }
            } else if (isEscapeKeyPress(event.key)) {
              this.setState({
                editUrl: false,
                inputUrl: url,
              });

              if (this.inputRef?.current) {
                this.inputRef.current.blur();
              }
            }
          }}
          ref={this.inputRef}
        />
        <button
          onClick={openInBrowser}
          type="button"
          className={classes.button}
          data-tooltip-id="tooltip-web-controls"
          data-tooltip-content={intl.formatMessage(messages.openInBrowser)}
          data-place="bottom"
        >
          <Icon icon={mdiEarth} className={classes.icon} />
        </button>
        <ReactTooltip
          id="tooltip-web-controls"
          place="bottom"
          variant="dark"
          style={{ height: 'auto' }}
        />
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(WebControls),
);
