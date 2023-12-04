import { Component, CSSProperties, ReactNode, MouseEvent } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import matchRoute from '../../helpers/routing-helpers';
import { openExternalUrl } from '../../helpers/url-helpers';
import { StoresProps } from '../../@types/ferdium-components.types';

interface IProps extends Partial<StoresProps> {
  children: ReactNode;
  to: string;
  className?: string;
  activeClassName?: string;
  strictFilter?: boolean;
  target?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

// TODO: create container component for this component
@inject('stores')
@observer
class Link extends Component<IProps> {
  onClick(e: MouseEvent<HTMLAnchorElement>): void {
    const { disabled = false, target = '', to } = this.props;
    if (disabled) {
      e.preventDefault();
    } else if (target === '_blank') {
      e.preventDefault();
      openExternalUrl(to, true);
    }
    // Note: if neither of the above, then let the other onClick handlers process it
  }

  render() {
    const {
      children,
      stores,
      to,
      className = '',
      activeClassName = '',
      strictFilter = false,
      disabled = false,
      style = {},
    } = this.props;
    const { router } = stores!;

    const filter = strictFilter ? `${to}` : `${to}(*action)`;
    const match = matchRoute(filter, router.location.pathname);

    const linkClasses = classnames({
      [`${className}`]: true,
      [`${activeClassName}`]: match,
      'is-disabled': disabled,
    });

    return (
      // biome-ignore lint/a11y/useValidAnchor: <explanation>
      <a
        href={router.history.createHref(to)}
        className={linkClasses}
        style={style}
        onClick={e => this.onClick(e)}
      >
        {children}
      </a>
    );
  }
}

export default Link;
