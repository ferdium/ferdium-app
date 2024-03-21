import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import Button from '../../ui/button';
import { H1 } from '../../ui/headline';

const messages = defineMessages({
  headline: {
    id: 'service.errorHandler.headline',
    defaultMessage: 'Oh no!',
  },
  text: {
    id: 'service.errorHandler.text',
    defaultMessage: '{name} has failed to load.',
  },
  action: {
    id: 'service.errorHandler.action',
    defaultMessage: 'Reload {name}',
  },
  editAction: {
    id: 'service.errorHandler.editAction',
    defaultMessage: 'Edit {name}',
  },
  errorMessage: {
    id: 'service.errorHandler.message',
    defaultMessage: 'Error',
  },
});

const styles = theme => ({
  component: {
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 0,
    alignItems: 'center',
    background: theme.colorWebviewErrorHandlerBackground,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: 'auto',
    margin: [40, 0, 20],

    '& button': {
      margin: [0, 10, 0, 10],
    },
  },
});

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  name: string;
  reload: () => void;
  edit: () => void;
  errorMessage: string;
}

@observer
class WebviewErrorHandler extends Component<IProps> {
  render(): ReactElement {
    const { name, reload, edit, errorMessage, classes, intl } = this.props;

    return (
      <div className={classes.component}>
        <H1>{intl.formatMessage(messages.headline)}</H1>
        <p>{intl.formatMessage(messages.text, { name })}</p>
        <p>
          <strong>{intl.formatMessage(messages.errorMessage)}:</strong>{' '}
          {errorMessage}
        </p>
        <div className={classes.buttonContainer}>
          <Button
            label={intl.formatMessage(messages.editAction, { name })}
            buttonType="inverted"
            onClick={() => edit()}
          />
          <Button
            label={intl.formatMessage(messages.action, { name })}
            buttonType="inverted"
            onClick={() => reload()}
          />
        </div>
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(WebviewErrorHandler),
);
