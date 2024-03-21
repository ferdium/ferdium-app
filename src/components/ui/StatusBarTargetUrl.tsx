import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Component } from 'react';
import Appear from './effects/Appear';

interface IProps {
  className?: string;
  text?: string;
}

// TODO: [TS DEBT] Should this file be converted into the coding style similar to './toggle/index.tsx'?
@observer
class StatusBarTargetUrl extends Component<IProps> {
  render() {
    const { className = '', text = '' } = this.props;

    return (
      <Appear
        className={classnames({
          'status-bar-target-url': true,
          [`${className}`]: true,
        })}
      >
        <div className="status-bar-target-url__content">{text}</div>
      </Appear>
    );
  }
}

export default StatusBarTargetUrl;
