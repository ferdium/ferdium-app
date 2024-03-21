import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Component, type ReactElement, type ReactNode } from 'react';
import withStyles, { type WithStylesProps } from 'react-jss';
import type { Theme } from '../../../themes';
import { H1 } from '../headline';
import Loader from '../loader/index';
import styles from './styles';

interface IProps extends WithStylesProps<typeof styles> {
  className?: string;
  title?: string;
  theme?: Theme;
  spinnerColor?: string;
  loaded?: boolean;
  children?: ReactNode;
}

@observer
class FullscreenLoader extends Component<IProps> {
  render(): ReactElement {
    const {
      classes,
      theme,
      className = '',
      spinnerColor = '',
      children = null,
      title = '',
      loaded = false,
    } = this.props;

    return (
      <div className={classes.wrapper}>
        <div
          className={classnames({
            [`${classes.component}`]: true,
            [`${className}`]: className,
          })}
        >
          <H1 className={classes.title}>{title}</H1>
          <Loader
            color={spinnerColor || theme?.colorFullscreenLoaderSpinner}
            loaded={loaded}
          />
          {children && <div className={classes.content}>{children}</div>}
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { injectTheme: true })(FullscreenLoader);
