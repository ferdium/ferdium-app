import { ReactNode, useEffect, useState } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

type Props = {
  children: ReactNode;
  transitionName: string;
  className?: string;
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
    <CSSTransitionGroup
      transitionName={transitionName}
      transitionAppear
      transitionLeave
      transitionAppearTimeout={1500}
      transitionEnterTimeout={1500}
      transitionLeaveTimeout={1500}
      className={className}
    >
      {children}
    </CSSTransitionGroup>
  );
};

Appear.defaultProps = {
  className: '',
};

export default Appear;
