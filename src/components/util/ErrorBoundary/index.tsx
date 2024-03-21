import { Component, type ReactNode } from 'react';
import { type IntlShape, defineMessages, injectIntl } from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';

import Button from '../../ui/button';
import { H1 } from '../../ui/headline';

import styles from './styles';

const messages = defineMessages({
  headline: {
    id: 'app.errorHandler.headline',
    defaultMessage: 'Something went wrong.',
  },
  action: {
    id: 'app.errorHandler.action',
    defaultMessage: 'Reload',
  },
});

interface ErrorBoundaryProps extends WithStylesProps<typeof styles> {
  intl: IntlShape;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  componentDidCatch(): void {
    this.setState({ hasError: true });
  }

  render(): ReactNode {
    const { classes, intl } = this.props;

    if (this.state.hasError) {
      return (
        <div className={classes.component}>
          <H1 className={classes.title}>
            {intl.formatMessage(messages.headline)}
          </H1>
          <Button
            label={intl.formatMessage(messages.action)}
            buttonType="inverted"
            onClick={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default withStyles(styles, { injectTheme: true })(
  injectIntl<'intl', ErrorBoundaryProps>(ErrorBoundary),
);
