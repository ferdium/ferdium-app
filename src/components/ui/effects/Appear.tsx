import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

interface IProps {
  children: ReactNode;
  transitionName?: string;
  className?: string;
  transitionAppear?: boolean;
  transitionLeave?: boolean;
  transitionAppearTimeout?: number;
  transitionEnterTimeout?: number;
  transitionLeaveTimeout?: number;
}

const Appear = ({
  children,
  transitionName = 'fadeIn',
  className = '',
  transitionAppear = true,
  transitionLeave = true,
  transitionAppearTimeout = 1500,
  transitionEnterTimeout = 1500,
  transitionLeaveTimeout = 1500,
}: IProps): ReactElement | null => {
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
      transitionAppear={transitionAppear}
      transitionLeave={transitionLeave}
      transitionAppearTimeout={transitionAppearTimeout}
      transitionEnterTimeout={transitionEnterTimeout}
      transitionLeaveTimeout={transitionLeaveTimeout}
      className={className}
    >
      {children}
    </CSSTransitionGroup>
  );
};

export default Appear;
