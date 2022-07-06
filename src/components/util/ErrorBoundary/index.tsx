import { Component, ReactNode } from 'react';
import withStyles, { WithStylesProps } from 'react-jss';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';

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
}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state = {
    hasError: false,
  };

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
