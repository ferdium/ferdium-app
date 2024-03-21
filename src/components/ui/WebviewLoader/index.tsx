import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import injectSheet, { type WithStylesProps } from 'react-jss';
import FullscreenLoader from '../FullscreenLoader';

const messages = defineMessages({
  loading: {
    id: 'service.webviewLoader.loading',
    defaultMessage: 'Loading {service}',
  },
});

const styles = theme => ({
  component: {
    background: theme.colorWebviewLoaderBackground,
    padding: 20,
    width: 'auto',
    margin: [0, 'auto'],
    borderRadius: 6,
  },
});

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  name: string;
  loaded?: boolean;
}

class WebviewLoader extends Component<IProps> {
  render(): ReactElement {
    const { classes, name, loaded = false, intl } = this.props;
    return (
      <FullscreenLoader
        className={classes.component}
        title={intl.formatMessage(messages.loading, { service: name })}
        loaded={loaded}
      />
    );
  }
}

export default injectIntl(
  injectSheet(styles, { injectTheme: true })(observer(WebviewLoader)),
);
