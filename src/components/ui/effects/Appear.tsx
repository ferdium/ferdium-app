import type { ReactElement, ReactNode } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

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
  return (
    <TransitionGroup component={null}>
      <CSSTransition
        classNames={transitionName || className}
        appear={transitionAppear}
        exit={transitionLeave}
        timeout={{
          enter: transitionEnterTimeout,
          appear: transitionAppearTimeout,
          exit: transitionLeaveTimeout,
        }}
      >
        {children}
      </CSSTransition>
    </TransitionGroup>
  );
};

export default Appear;
