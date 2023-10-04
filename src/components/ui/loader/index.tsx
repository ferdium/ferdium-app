import classnames from 'classnames';
import { Component } from 'react';
import injectStyle, { WithStylesProps } from 'react-jss';
import { Oval } from 'react-loader-spinner';
import { inject } from 'mobx-react';
import { FerdiumStores } from '../../../@types/stores.types';

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
  size?: number | string;
  loaded?: boolean;
  stores?: FerdiumStores;
}

@inject('stores')
class LoaderComponent extends Component<IProps> {
  render() {
    const {
      classes,
      className,
      size = 36,
      color = '#FFF',
      loaded = false,
    } = this.props;
    const loaderColor =
      color === 'brandColor'
        ? this.props.stores!.settings.app.accentColor
        : color;
    return (
      <div
        className={classnames({
          [classes.container]: true,
          [`${className}`]: className,
        })}
        data-type="franz-loader"
      >
        {/* loaded = true === visible = false */}
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
