import { mdiCloseCircleOutline, mdiMagnify } from '@mdi/js';
import classnames from 'classnames';
import { debounce, noop } from 'lodash';
import { observer } from 'mobx-react';
import { type ChangeEvent, Component, type ReactElement } from 'react';
import Icon from './icon';

interface IProps {
  value?: string;
  placeholder: string;
  className?: string;
  onChange?: (e: string) => void;
  onReset: () => void;
  name?: string;
  throttle?: boolean;
  throttleDelay?: number;
  autoFocus?: boolean;
}

interface IState {
  value: string;
}

@observer
class SearchInput extends Component<IProps, IState> {
  input: HTMLInputElement | null = null;

  constructor(props: IProps) {
    super(props);

    this.state = {
      value: props.value || '',
    };

    this.throttledOnChange = debounce(
      this.throttledOnChange,
      this.props.throttleDelay,
    );
  }

  componentDidMount(): void {
    const { autoFocus = false } = this.props;

    if (autoFocus && this.input) {
      this.input.focus();
    }
  }

  onChange(e: ChangeEvent<HTMLInputElement>): void {
    const { throttle = false, onChange = noop } = this.props;
    const { value } = e.target;
    this.setState({ value });

    if (throttle) {
      e.persist();
      this.throttledOnChange(value);
    } else {
      onChange(value);
    }
  }

  throttledOnChange(e: string): void {
    const { onChange = noop } = this.props;

    onChange(e);
  }

  reset(): void {
    const { onReset = noop } = this.props;
    this.setState({ value: '' });

    onReset();
  }

  render(): ReactElement {
    const {
      className = '',
      name = 'searchInput',
      placeholder = '',
    } = this.props;
    const { value = '' } = this.state;

    return (
      <div className={classnames([className, 'search-input'])}>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor={name}>
          <Icon icon={mdiMagnify} />
          <input
            name={name}
            id={name}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={e => this.onChange(e)}
            ref={ref => {
              this.input = ref;
            }}
          />
        </label>
        {value.length > 0 && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <span onClick={() => this.reset()} onKeyDown={noop}>
            <Icon icon={mdiCloseCircleOutline} />
          </span>
        )}
      </div>
    );
  }
}

export default SearchInput;
