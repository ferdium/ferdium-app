import { Fragment, type ReactElement } from 'react';

export interface IProps {
  children:
    | string
    | ReactElement<HTMLInputElement>
    | (
        | boolean
        | ReactElement<HTMLInputElement>
        | ReactElement<HTMLParagraphElement>
      )[];
  title?: string; // it is used on Tabs.tsx
}

const TabItem = ({ children, title = '' }: IProps): ReactElement => {
  return <Fragment key={title}>{children}</Fragment>;
};

export default TabItem;
