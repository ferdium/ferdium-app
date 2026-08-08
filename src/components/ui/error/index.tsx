import type { Classes } from 'jss';
import { Component } from 'react';
import { useStyles } from 'react-jss';

import styles from './styles';

interface IProps {
  classes: Classes;
  message: string;
}

function ErrorComponent({ classes, message }: IProps) {
  useStyles(styles);

  return <p className={classes.message}>{message}</p>;
}

export default ErrorComponent;
