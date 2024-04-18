import classnames from 'classnames';
import { observer } from 'mobx-react';
import {
  Children,
  Component,
  type ReactElement,
  type ReactPortal,
} from 'react';
import type { IProps as TabItemProps } from './TabItem';

interface IProps {
  children:
    | ReactElement<TabItemProps>
    | (boolean | ReactElement<TabItemProps>)[];
  active?: number;
}

interface IState {
  active: number;
}

@observer
class Tab extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      active: this.props.active || 0,
    };
  }

  switchTab(index: number): void {
    this.setState({ active: index });
  }

  render(): ReactElement {
    const { children: childElements } = this.props;
    // eslint-disable-next-line @eslint-react/no-children-to-array
    const children = Children.toArray(childElements); // removes all null values

    if (children.length === 1) {
      return <div>{children}</div>;
    }

    return (
      <div className="content-tabs">
        <div className="content-tabs__tabs">
          {/* eslint-disable-next-line @eslint-react/no-children-map */}
          {Children.map(children, (child, i) => (
            <button
              // eslint-disable-next-line react/no-array-index-key, @eslint-react/no-array-index-key
              key={i}
              className={classnames({
                'content-tabs__item': true,
                'is-active': this.state.active === i,
              })}
              onClick={() => this.switchTab(i)}
              type="button"
            >
              {(child as ReactPortal).props.title}
            </button>
          ))}
        </div>
        <div className="content-tabs__content">
          {/* eslint-disable-next-line @eslint-react/no-children-map */}
          {Children.map(children, (child, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key, @eslint-react/no-array-index-key
              key={i}
              className={classnames({
                'content-tabs__item': true,
                'is-active': this.state.active === i,
              })}
              // type="button"
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Tab;
