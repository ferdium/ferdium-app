import classnames from 'classnames';
import { Component, type ReactNode } from 'react';
import injectStyle, { type WithStylesProps } from 'react-jss';

// eslint-disable-next-line no-use-before-define
interface IProps extends WithStylesProps<typeof styles> {
  children: ReactNode;
  className?: string;
  identifier: string;
  // eslint-disable-next-line react/no-unused-prop-types
  noMargin?: boolean;
}

const styles = {
  container: {
    marginBottom: (props: IProps) => (props.noMargin ? 0 : 20),
  },
};

class WrapperComponent extends Component<IProps> {
  render() {
    const { children, classes, className, identifier } = this.props;

    return (
      <div
        className={classnames({
          [`${classes.container}`]: true,
          [`${className}`]: className,
        })}
        data-type={identifier}
      >
        {children}
      </div>
    );
  }
}

export default injectStyle(styles, { injectTheme: true })(WrapperComponent);
