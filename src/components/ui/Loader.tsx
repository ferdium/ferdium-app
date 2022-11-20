import { Component, ReactElement, ReactNode } from 'react';
import { observer, inject } from 'mobx-react';
import Loader from 'react-loader';

import { FerdiumStores } from '../../@types/stores.types';

interface IProps {
  className?: string;
  color?: string;
  loaded?: boolean;
  stores?: FerdiumStores;
  children?: ReactNode;
}

// Can this file be merged into the './loader/index.tsx' file?
@inject('stores')
@observer
class LoaderComponent extends Component<IProps> {
  render(): ReactElement {
    const {
      loaded = false,
      color = 'ACCENT',
      className,
      children,
    } = this.props;

    const loaderColor =
      color !== 'ACCENT' ? color : this.props.stores!.settings.app.accentColor;

    return (
      <Loader
        loaded={loaded}
        width={4}
        scale={0.6}
        color={loaderColor}
        component="span"
        className={className}
      >
        {children}
      </Loader>
    );
  }
}

export default LoaderComponent;
