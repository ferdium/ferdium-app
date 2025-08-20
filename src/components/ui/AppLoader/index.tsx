import classnames from 'classnames';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import shuffleArray from '../../../helpers/array-helpers';
import type { Theme } from '../../../themes';
import FullscreenLoader from '../FullscreenLoader';

import styles from './styles';

const messages = defineMessages({
  addingFreeFeatures: {
    id: 'loading.addingFreeFeatures',
    defaultMessage: 'Adding free features',
  },
  makingApplicationUsable: {
    id: 'loading.makingApplicationUsable',
    defaultMessage: 'Making application usable',
  },
  removingUnproductivePaywalls: {
    id: 'loading.removingUnproductivePaywalls',
    defaultMessage: 'Removing unproductive paywalls',
  },
  creatingCustomServerSoftware: {
    id: 'loading.creatingCustomServerSoftware',
    defaultMessage: 'Creating custom server software',
  },
  increasingProductivity: {
    id: 'loading.increasingProductivity',
    defaultMessage: 'Increasing productivity',
  },
  listeningToOurUserbase: {
    id: 'loading.listeningToOurUserbase',
    defaultMessage: 'Listening to our userbase',
  },
  fixingBugs: {
    id: 'loading.fixingBugs',
    defaultMessage: 'Fixing bugs',
  },
});

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  theme: Theme;
  texts?: string[];
}

interface IState {
  step: number;
}

class AppLoader extends Component<IProps, IState> {
  interval: NodeJS.Timeout | null = null;

  constructor(props: IProps) {
    super(props);

    this.state = {
      step: 0,
    };
  }

  componentDidMount(): void {
    const { intl } = this.props;
    const defaultTexts = shuffleArray([
      intl.formatMessage(messages.addingFreeFeatures),
      intl.formatMessage(messages.makingApplicationUsable),
      intl.formatMessage(messages.removingUnproductivePaywalls),
      intl.formatMessage(messages.creatingCustomServerSoftware),
      intl.formatMessage(messages.increasingProductivity),
      intl.formatMessage(messages.listeningToOurUserbase),
      intl.formatMessage(messages.fixingBugs),
    ]);
    const texts = this.props.texts || defaultTexts;

    this.interval = setInterval(() => {
      this.setState((prevState: { step: number }) => ({
        step: prevState.step === texts.length - 1 ? 0 : prevState.step + 1,
      }));
    }, 2500);
  }

  componentWillUnmount(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render(): ReactElement {
    const { classes, theme, intl } = this.props;
    const { step } = this.state;

    const defaultTexts = shuffleArray([
      intl.formatMessage(messages.addingFreeFeatures),
      intl.formatMessage(messages.makingApplicationUsable),
      intl.formatMessage(messages.removingUnproductivePaywalls),
      intl.formatMessage(messages.creatingCustomServerSoftware),
      intl.formatMessage(messages.increasingProductivity),
      intl.formatMessage(messages.listeningToOurUserbase),
      intl.formatMessage(messages.fixingBugs),
    ]);
    const texts = this.props.texts || defaultTexts;

    return (
      <FullscreenLoader
        className={classes.component}
        spinnerColor={theme.colorAppLoaderSpinner}
      >
        {texts.map((text, i) => (
          <span
            key={text}
            className={classnames({
              [`${classes.slogan}`]: true,
              [`${classes.visible}`]: step === i,
            })}
          >
            {text}
          </span>
        ))}
      </FullscreenLoader>
    );
  }
}

export default injectIntl(withStyles(styles, { injectTheme: true })(AppLoader));
