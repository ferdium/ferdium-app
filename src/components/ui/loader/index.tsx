import classnames from 'classnames';
import { inject } from 'mobx-react';
import { Component } from 'react';
import injectStyle, { type WithStylesProps } from 'react-jss';
import { Oval } from 'react-loader-spinner';
import type { FerdiumStores } from '../../../@types/stores.types';
import { DEFAULT_LOADER_COLOR } from '../../../config';

const styles = () => ({
  container: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'inherit',
  },
});

interface IProps extends WithStylesProps<typeof styles> {
  className?: string;
  color?: string;
  size?: number;
  loaded?: boolean;
  stores?: FerdiumStores;
}

@inject('stores')
class LoaderComponent extends Component<IProps> {
  render() {
    const {
      classes,
      className,
      size = 100,
      color = this.props.stores?.settings.app.accentColor,
      loaded = false,
    } = this.props;
    const loaderColor = color ?? DEFAULT_LOADER_COLOR;

    return (
      <div
        className={classnames({
          [classes.container]: true,
          [`${className}`]: className,
        })}
        data-type="franz-loader"
      >
        <Oval
          strokeWidth={5}
          color={loaderColor}
          secondaryColor={loaderColor}
          height={size}
          width={size}
          visible={!loaded}
        />
      </div>
    );
  }
}

export default injectStyle(styles, { injectTheme: true })(LoaderComponent);
