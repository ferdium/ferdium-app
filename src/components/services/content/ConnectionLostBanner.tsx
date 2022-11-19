import { Component, ReactElement } from 'react';
import { observer } from 'mobx-react';
import withStyles, { WithStylesProps } from 'react-jss';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { mdiAlert } from '@mdi/js';
import { LIVE_API_FERDIUM_WEBSITE } from '../../../config';
import Icon from '../../ui/icon';

const messages = defineMessages({
  text: {
    id: 'connectionLostBanner.message',
    defaultMessage: 'Oh no! Ferdium lost the connection to {name}.',
  },
  moreInformation: {
    id: 'connectionLostBanner.informationLink',
    defaultMessage: 'What happened?',
  },
  cta: {
    id: 'connectionLostBanner.cta',
    defaultMessage: 'Reload Service',
  },
});

const buttonTransition =
  window && window.matchMedia('(prefers-reduced-motion: no-preference)')
    ? 'opacity 0.25s'
    : 'none';

const styles = theme => ({
  root: {
    background: theme.colorBackground,
    borderRadius: theme.borderRadius,
    position: 'absolute',
    zIndex: 300,
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    bottom: 10,
    right: 10,
    justifyContent: 'center',
    padding: 10,
    fontSize: 12,
  },
  link: {
    display: 'inline-flex',
    opacity: 0.7,
  },
  button: {
    transition: buttonTransition,
    color: theme.colorText,
    border: [1, 'solid', theme.colorText],
    borderRadius: theme.borderRadiusSmall,
    padding: 4,
    fontSize: 12,
    marginLeft: 15,

    '&:hover': {
      opacity: 0.8,
    },
  },
  icon: {
    marginRight: 10,
    fill: theme.styleTypes.danger.accent,
  },
});

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  name: string;
  reload: () => void;
}

@observer
class ConnectionLostBanner extends Component<IProps> {
  render(): ReactElement {
    const { classes, name, reload, intl } = this.props;

    return (
      <div className={classes.root}>
        <Icon icon={mdiAlert} className={classes.icon} />
        <p>
          {intl.formatMessage(messages.text, { name })}
          <br />
          <a
            href={`${LIVE_API_FERDIUM_WEBSITE}/support#what-does-franz-lost-the-connection-to-service-mean`}
            className={classes.link}
          >
            {intl.formatMessage(messages.moreInformation)}
          </a>
        </p>
        <button type="button" className={classes.button} onClick={reload}>
          {intl.formatMessage(messages.cta)}
        </button>
      </div>
    );
  }
}

export default injectIntl(withStyles(styles)(ConnectionLostBanner));
