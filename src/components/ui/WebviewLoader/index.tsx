import { Component, ReactElement } from 'react';
import { observer } from 'mobx-react';
import injectSheet, { WithStylesProps } from 'react-jss';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
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
        title={`${intl.formatMessage(messages.loading, { service: name })}`}
        loaded={loaded}
      />
    );
  }
}

export default injectIntl(
  injectSheet(styles, { injectTheme: true })(observer(WebviewLoader)),
);
