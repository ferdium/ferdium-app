import { Children, Component, ReactElement, ReactPortal } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { IProps as TabItemProps } from './TabItem';

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
    const children = Children.toArray(childElements); // removes all null values

    if (children.length === 1) {
      return <div>{children}</div>;
    }

    return (
      <div className="content-tabs">
        <div className="content-tabs__tabs">
          {Children.map(children, (child, i) => (
            <button
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
          {Children.map(children, (child, i) => (
            <div
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
