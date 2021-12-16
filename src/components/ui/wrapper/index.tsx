import classnames from 'classnames';
import { Component, ReactNode } from 'react';
import injectStyle, { WithStylesProps } from 'react-jss';

interface IProps extends WithStylesProps<typeof styles> {
  children: ReactNode;
  className?: string;
  identifier: string;
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

export const Wrapper = injectStyle(styles, { injectTheme: true })(
  WrapperComponent,
);
