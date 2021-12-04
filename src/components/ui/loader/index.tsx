import classnames from 'classnames';
import { Component } from 'react';
import injectStyle, { WithStylesProps } from 'react-jss';
import ReactLoader from 'react-loader';

interface IProps extends WithStylesProps<typeof styles> {
  className?: string;
  color?: string;
}

const styles = theme => ({
  container: {
    position: 'relative',
    height: 60,
  },
  loader: {},
  color: theme.colorText,
});

class LoaderComponent extends Component<IProps> {
  render() {
    const { classes, className, color } = this.props;

    return (
      <div
        className={classnames({
          [classes.container]: true,
          [`${className}`]: className,
        })}
        data-type="franz-loader"
      >
        <ReactLoader
          loaded={false}
          width={4}
          scale={0.75}
          color={color || classes.color}
          parentClassName={classes.loader}
        />
      </div>
    );
  }
}

export const Loader = injectStyle(styles, { injectTheme: true })(
  LoaderComponent,
);
