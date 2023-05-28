import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

interface IProps {
  children: ReactNode;
  transitionName?: string;
  className?: string;
  transitionAppear?: boolean;
  transitionLeave?: boolean;
  transitionEnterTimeout?: number;
  transitionLeaveTimeout?: number;
}

const Appear = ({
  children,
  transitionName = 'fadeIn',
  className = '',
  transitionAppear = true,
  transitionLeave = true,
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
    <TransitionGroup
      appear={transitionAppear}
      exit={transitionLeave}
      className={className}
    >
      <CSSTransition
        classNames={transitionName}
        timeout={{
          enter: transitionEnterTimeout,
          exit: transitionLeaveTimeout,
        }}
      >
        {children}
      </CSSTransition>
    </TransitionGroup>
  );
};

export default Appear;
