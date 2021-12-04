import { Classes } from 'jss';
import { Component } from 'react';
import injectSheet from 'react-jss';

import styles from './styles';

interface IProps {
  classes: Classes;
  message: string;
}

class ErrorComponent extends Component<IProps> {
  render() {
    const { classes, message } = this.props;

    return <p className={classes.message}>{message}</p>;
  }
}

export const Error = injectSheet(styles, { injectTheme: true })(ErrorComponent);
