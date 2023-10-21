import { Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import withStyles, { WithStylesProps } from 'react-jss';
import classnames from 'classnames';
import Loader from '../loader/index';
import styles from './styles';
import { H1 } from '../headline';
import { Theme } from '../../../themes';

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
