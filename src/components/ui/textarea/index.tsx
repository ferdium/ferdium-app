import classnames from 'classnames';
import { Component, createRef, TextareaHTMLAttributes } from 'react';
import injectSheet, { WithStylesProps } from 'react-jss';

import { IFormField } from '../typings/generic';

import { Error } from '../error';
import { Label } from '../label';
import { Wrapper } from '../wrapper';

import styles from './styles';

interface IData {
  [index: string]: string;
}

interface IProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    IFormField,
    WithStylesProps<typeof styles> {
  focus?: boolean;
  data: IData;
  textareaClassName?: string;
}

class TextareaComponent extends Component<IProps> {
  static defaultProps = {
    focus: false,
    onChange: () => {},
    onBlur: () => {},
    onFocus: () => {},
    showLabel: true,
    disabled: false,
    rows: 5,
  };

  private textareaRef = createRef<HTMLTextAreaElement>();

  componentDidMount() {
    const { data } = this.props;

    if (this.textareaRef && this.textareaRef.current && data) {
      Object.keys(data).map(
        key => (this.textareaRef.current!.dataset[key] = data[key]),
      );
    }
  }

  onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { onChange } = this.props;

    if (onChange) {
      onChange(e);
    }
  }

  render() {
    const {
      classes,
      className,
      disabled,
      error,
      id,
      textareaClassName,
      label,
      showLabel,
      value,
      name,
      placeholder,
      spellCheck,
      onBlur,
      onFocus,
      minLength,
      maxLength,
      required,
      rows,
      noMargin,
    } = this.props;

    return (
      <Wrapper
        className={className}
        identifier="franz-textarea"
        noMargin={noMargin}
      >
        <Label
          title={label}
          showLabel={showLabel}
          htmlFor={id}
          className={classes.label}
          isRequired={required}
        >
          <div
            className={classnames({
              [`${textareaClassName}`]: textareaClassName,
              [`${classes.wrapper}`]: true,
              [`${classes.disabled}`]: disabled,
              [`${classes.hasError}`]: error,
            })}
          >
            <textarea
              id={id}
              name={name}
              placeholder={placeholder}
              spellCheck={spellCheck}
              className={classes.textarea}
              ref={this.textareaRef}
              onChange={this.onChange.bind(this)}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={disabled}
              minLength={minLength}
              maxLength={maxLength}
              rows={rows}
            >
              {value}
            </textarea>
          </div>
        </Label>
        {error && <Error message={error} />}
      </Wrapper>
    );
  }
}

export const Textarea = injectSheet(styles, { injectTheme: true })(
  TextareaComponent,
);
