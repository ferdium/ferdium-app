import classnames from 'classnames';
import { Component, LabelHTMLAttributes } from 'react';
import injectSheet, { WithStylesProps } from 'react-jss';

import { IFormField } from '../typings/generic';

import styles from './styles';

interface ILabel
  extends IFormField,
    LabelHTMLAttributes<HTMLLabelElement>,
    WithStylesProps<typeof styles> {
  isRequired?: boolean;
}

class LabelComponent extends Component<ILabel> {
  static defaultProps = {
    showLabel: true,
  };

  render() {
    const {
      title,
      showLabel,
      classes,
      className,
      children,
      htmlFor,
      isRequired,
    } = this.props;

    if (!showLabel) return children;

    return (
      <label
        className={classnames({
          [`${className}`]: className,
        })}
        htmlFor={htmlFor}
      >
        {showLabel && (
          <span className={classes.label}>
            {title}
            {isRequired && ' *'}
          </span>
        )}
        <div className={classes.content}>{children}</div>
      </label>
    );
  }
}

export const Label = injectSheet(styles, { injectTheme: true })(LabelComponent);
