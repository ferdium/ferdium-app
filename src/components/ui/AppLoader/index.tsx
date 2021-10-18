import { Component } from 'react';
import injectSheet, { withTheme } from 'react-jss';
import classnames from 'classnames';

import FullscreenLoader from '../FullscreenLoader';
import { shuffleArray } from '../../../helpers/array-helpers';

import styles from './styles';

// TODO: Need to externalize for i18n
const textList = shuffleArray([
  'Adding free features',
  'Making application usable',
  'Removing unproductive paywalls',
  'Creating custom server software',
  'Increasing productivity',
  'Listening to our userbase',
  'Fixing bugs',
]);

type Props = {
  classes: typeof styles;
  theme: any;
  texts: string[];
};

@injectSheet(styles)
@withTheme
class AppLoader extends Component<Props> {
  static defaultProps = {
    texts: textList,
  };

  state = {
    step: 0,
  };

  interval: NodeJS.Timeout | null = null;

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState((prevState: { step: number }) => ({
        step: prevState.step === textList.length - 1 ? 0 : prevState.step + 1,
      }));
    }, 2500);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render() {
    const { classes, theme, texts } = this.props;
    const { step } = this.state;

    return (
      <FullscreenLoader
        title="Ferdi"
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

export default AppLoader;
