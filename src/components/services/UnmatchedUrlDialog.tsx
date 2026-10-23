import { dialog, getCurrentWindow } from '@electron/remote';
import { useEffect } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';

import globalMessages from '../../i18n/globalMessages';

const messages = defineMessages({
  title: {
    id: 'service.unmatchedUrl.title',
    defaultMessage: 'No service for this link',
  },
  detail: {
    id: 'service.unmatchedUrl.detail',
    defaultMessage: "{url} doesn't match any of your services.",
  },
});

interface IProps extends WrappedComponentProps {
  url: string | null;
  onClose: () => void;
}

/**
 * Tells the user that a link Ferdium was asked to open matches none of the
 * services.
 */
function UnmatchedUrlDialog({ url, onClose, intl }: IProps) {
  useEffect(() => {
    if (!url) {
      return;
    }

    dialog
      .showMessageBox(getCurrentWindow(), {
        type: 'info',
        message: intl.formatMessage(messages.title),
        detail: intl.formatMessage(messages.detail, { url }),
        buttons: [intl.formatMessage(globalMessages.ok)],
      })
      .then(() => onClose());
  }, [url, intl, onClose]);

  return null;
}

export default injectIntl(UnmatchedUrlDialog);
