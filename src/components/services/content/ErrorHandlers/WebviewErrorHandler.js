import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import injectSheet from 'react-jss';

import Button from '../../../ui/Button';

import styles from './styles';
import { H1 } from '../../../ui/headline';

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

class WebviewErrorHandler extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    reload: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired,
    errorMessage: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
  };

  render() {
    const { name, reload, edit, errorMessage, classes } = this.props;
    const { intl } = this.props;

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
  injectSheet(styles, { injectTheme: true })(observer(WebviewErrorHandler)),
);
