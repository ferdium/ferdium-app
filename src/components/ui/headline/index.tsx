import classnames from 'classnames';
import {
  Component,
  createElement,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from 'react';
import injectStyle, { WithStylesProps } from 'react-jss';

import { Theme } from '../../../themes';
import { Omit } from '../typings/generic';

interface IProps extends WithStylesProps<typeof styles> {
  children: ReactNode;
  level?: number;
  className?: string;
  id?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const styles = (theme: Theme) => ({
  headline: {
    fontWeight: 'lighter',
    color: theme.colorText,
    marginTop: 0,
    marginBottom: 10,
    textAlign: 'left',
  },
  h1: {
    fontSize: theme.uiFontSize + 3,
    marginTop: 0,
  },
  h2: {
    fontSize: theme.uiFontSize + 2,
  },
  h3: {
    fontSize: theme.uiFontSize + 1,
  },
  h4: {
    fontSize: theme.uiFontSize,
  },
  h5: {
    fontSize: theme.uiFontSize - 1,
  },
});

class HeadlineComponent extends Component<IProps> {
  render(): ReactElement {
    const { classes, level, className, children, id, onClick } = this.props;

    return createElement(
      `h${level}`,
      {
        id,
        className: classnames({
          [classes.headline]: true,
          [classes[level ? `h${level}` : 'h1']]: true,
          [`${className}`]: className,
        }),
        'data-type': 'franz-headline',
        onClick,
      },
      children,
    );
  }
}

const Headline = injectStyle(styles, { injectTheme: true })(HeadlineComponent);
const createH = (level: number) => (props: Omit<IProps, 'classes'>) =>
  (
    <Headline level={level} {...props}>
      {props.children}
    </Headline>
  );

export const H1 = createH(1);
export const H2 = createH(2);
export const H3 = createH(3);
export const H4 = createH(4);
export const H5 = createH(5);
