import { ChangeEvent, Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { debounce } from 'lodash';
import { mdiCloseCircleOutline, mdiMagnify } from '@mdi/js';
import { Icon } from './icon';

type Props = {
  value: string;
  placeholder: string;
  className: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  name: string;
  throttle: boolean;
  throttleDelay: number;
  autoFocus: boolean;
};

class SearchInput extends Component<Props> {
  static defaultProps = {
    value: '',
    placeholder: '',
    className: '',
    name: 'searchInput',
    throttle: false,
    throttleDelay: 250,
    onChange: () => null,
    onReset: () => null,
    autoFocus: false,
  };

  input = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      value: props.value,
    };

    this.throttledOnChange = debounce(
      this.throttledOnChange,
      this.props.throttleDelay,
    );
  }

  componentDidMount() {
    const { autoFocus } = this.props;

    if (autoFocus) {
      // @ts-expect-error Object is possibly 'null'.
      this.input.focus();
    }
  }

  onChange(e: ChangeEvent<HTMLInputElement>) {
    const { throttle, onChange } = this.props;
    const { value } = e.target;
    this.setState({ value });

    if (throttle) {
      e.persist();
      // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'ChangeEvent<HTMLInputElement>'.
      this.throttledOnChange(value);
    } else {
      // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'ChangeEvent<HTMLInputElement>'.
      onChange(value);
    }
  }

  throttledOnChange(e: ChangeEvent<HTMLInputElement>) {
    const { onChange } = this.props;

    onChange(e);
  }

  reset() {
    const { onReset } = this.props;
    this.setState({ value: '' });

    onReset();
  }

  render() {
    const { className, name, placeholder } = this.props;
    // @ts-expect-error Property 'value' does not exist on type 'Readonly<{}>'.
    const { value } = this.state;

    return (
      <div className={classnames([className, 'search-input'])}>
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
              // @ts-expect-error Type 'HTMLInputElement | null' is not assignable to type 'null'.
              this.input = ref;
            }}
          />
        </label>
        {value.length > 0 && (
          <span onClick={() => this.reset()}>
            <Icon icon={mdiCloseCircleOutline} />
          </span>
        )}
      </div>
    );
  }
}

export default observer(SearchInput);
