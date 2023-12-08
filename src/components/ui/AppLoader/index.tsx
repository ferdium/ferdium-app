import { Component, ReactElement } from 'react';
import classnames from 'classnames';
import withStyles, { WithStylesProps } from 'react-jss';
import { Theme } from '../../../themes';
import FullscreenLoader from '../FullscreenLoader';
import shuffleArray from '../../../helpers/array-helpers';

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

interface IProps extends WithStylesProps<typeof styles> {
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
    this.interval = setInterval(() => {
      this.setState((prevState: { step: number }) => ({
        step: prevState.step === textList.length - 1 ? 0 : prevState.step + 1,
      }));
    }, 2500);
  }

  componentWillUnmount(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  render(): ReactElement {
    const { classes, theme, texts = textList } = this.props;
    const { step } = this.state;

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

export default withStyles(styles, { injectTheme: true })(AppLoader);
