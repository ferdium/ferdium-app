import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, PropTypes as MobxPropTypes, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import { defineMessages, injectIntl } from 'react-intl';
import Confetti from 'react-confetti';
import ms from 'ms';
import injectSheet from 'react-jss';

import ServiceView from './ServiceView';
import Appear from '../../ui/effects/Appear';

const messages = defineMessages({
  getStarted: {
    id: 'services.getStarted',
    defaultMessage: 'Get started',
  },
  login: {
    id: 'services.login',
    defaultMessage: 'Please login to use Ferdium.',
  },
  serverless: {
    id: 'services.serverless',
    defaultMessage: 'Use Ferdium without an Account',
  },
  serverInfo: {
    id: 'services.serverInfo',
    defaultMessage:
      'Optionally, you can change your Ferdium server by clicking the cog in the bottom left corner. If you are switching over (from one of the hosted servers) to using Ferdium without an account, please be informed that you can export your data from that server and subsequently import it using the Help menu to resurrect all your workspaces and configured services!',
  },
});

const styles = {
  confettiContainer: {
    position: 'absolute',
    width: '100%',
    zIndex: 9999,
    pointerEvents: 'none',
  },
};

class Services extends Component {
  static propTypes = {
    services: MobxPropTypes.arrayOrObservableArray,
    setWebviewReference: PropTypes.func.isRequired,
    detachService: PropTypes.func.isRequired,
    handleIPCMessage: PropTypes.func.isRequired,
    openWindow: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
    openSettings: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    userHasCompletedSignup: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    classes: PropTypes.object.isRequired,
    isSpellcheckerEnabled: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    services: [],
  };

  _confettiTimeout = null;

  constructor() {
    super();

    this.state = {
      showConfetti: true,
    };
  }

  componentDidMount() {
    this._confettiTimeout = window.setTimeout(() => {
      this.setState({
        showConfetti: false,
      });
    }, ms('8s'));
  }

  componentWillUnmount() {
    if (this._confettiTimeout) {
      clearTimeout(this._confettiTimeout);
    }
  }

  render() {
    const {
      services,
      handleIPCMessage,
      setWebviewReference,
      detachService,
      openWindow,
      reload,
      openSettings,
      update,
      userHasCompletedSignup,
      classes,
      isSpellcheckerEnabled,
    } = this.props;

    const { showConfetti } = this.state;

    const { intl } = this.props;

    return (
      <div className="services">
        {userHasCompletedSignup && (
          <div className={classes.confettiContainer}>
            <Confetti
              width={window.width}
              height={window.height}
              numberOfPieces={showConfetti ? 200 : 0}
            />
          </div>
        )}
        {services.length === 0 && (
          <Appear timeout={1500} transitionName="slideUp">
            <div className="services__no-service">
              <img
                src="./assets/images/logo-beard-only.svg"
                alt="Logo"
                style={{ maxHeight: '50vh' }}
              />
              <Appear timeout={300} transitionName="slideUp">
                <Link to="/settings/recipes" className="button">
                  {intl.formatMessage(messages.getStarted)}
                </Link>
              </Appear>
            </div>
          </Appear>
        )}
        {services
          .filter(service => !service.isTodosService)
          .map(service => (
            <ServiceView
              key={service.id}
              service={service}
              handleIPCMessage={handleIPCMessage}
              setWebviewReference={setWebviewReference}
              detachService={detachService}
              openWindow={openWindow}
              reload={() => reload({ serviceId: service.id })}
              edit={() => openSettings({ path: `services/edit/${service.id}` })}
              enable={() =>
                update({
                  serviceId: service.id,
                  serviceData: {
                    isEnabled: true,
                  },
                  redirect: false,
                })
              }
              isSpellcheckerEnabled={isSpellcheckerEnabled}
            />
          ))}
      </div>
    );
  }
}

export default injectIntl(
  injectSheet(styles, { injectTheme: true })(
    inject('actions')(observer(Services)),
  ),
);
