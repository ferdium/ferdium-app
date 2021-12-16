import { ReactChildren, useEffect, useState } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

type Props = {
  children: ReactChildren;
  transitionName: string;
  className: string;
};
const Appear = ({
  children,
  transitionName = 'fadeIn',
  className = '',
}: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ReactCSSTransitionGroup
      transitionName={transitionName}
      transitionAppear
      transitionLeave
      transitionAppearTimeout={1500}
      transitionEnterTimeout={1500}
      transitionLeaveTimeout={1500}
      className={className}
    >
      {children}
    </ReactCSSTransitionGroup>
  );
};

export default Appear;
