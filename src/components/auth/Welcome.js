/* eslint jsx-a11y/anchor-is-valid: 0 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, PropTypes as MobxPropTypes, inject } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import serverlessLogin from '../../helpers/serverless-helpers';
import { shuffleArray } from '../../helpers/array-helpers';

import Link from '../ui/Link';

const messages = defineMessages({
  signupButton: {
    id: 'welcome.signupButton',
    defaultMessage: 'Create a free account',
  },
  loginButton: {
    id: 'welcome.loginButton',
    defaultMessage: 'Login to your account',
  },
  changeServer: {
    id: 'login.changeServer',
    defaultMessage: 'Change server'
  },
  serverless: {
    id: 'services.serverless',
    defaultMessage: 'Use Ferdi without an Account',
  },
});

class Welcome extends Component {
  static propTypes = {
    loginRoute: PropTypes.string.isRequired,
    signupRoute: PropTypes.string.isRequired,
    changeServerRoute: PropTypes.string.isRequired,
    recipes: MobxPropTypes.arrayOrObservableArray.isRequired,
    actions: PropTypes.object.isRequired,
  };

  useLocalServer() {
    serverlessLogin(this.props.actions);
  }

  render() {
    const { intl } = this.props;
    const { loginRoute, signupRoute, changeServerRoute } = this.props;
    let { recipes } = this.props;
    recipes = shuffleArray(recipes);
    recipes.length = 8 * 2;
    return (
      <div className="welcome">
        <div className="welcome__content">
          <img
            src="./assets/images/logo.svg"
            className="welcome__logo"
            alt=""
          />
          {/* <img src="./assets/images/welcome.png" className="welcome__services" alt="" /> */}
          <div className="welcome__text">
            <h1>Ferdi</h1>
          </div>
        </div>
        <div className="welcome__buttons">
          <Link to={signupRoute} className="button button__inverted">
            {intl.formatMessage(messages.signupButton)}
          </Link>
          <Link to={loginRoute} className="button">
            {intl.formatMessage(messages.loginButton)}
          </Link>
          <Link to={changeServerRoute}>
            <span
              style={{
                color: '#fff'
              }}
            >
              {intl.formatMessage(messages.changeServer)}
            </span>
          </Link>
          <br />
          <br />
          <hr />
          <br />
          <a className="button" onClick={this.useLocalServer.bind(this)}>
            {intl.formatMessage(messages.serverless)}
          </a>
        </div>
        <div className="welcome__featured-services">
          {recipes.map(recipe => (
            <div key={recipe.id} className="welcome__featured-service">
              <img key={recipe.id} src={recipe.icons.svg} alt="" />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default injectIntl(inject('actions')(observer(Welcome)));
