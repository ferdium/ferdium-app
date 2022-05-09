/* eslint-disable no-await-in-loop */
import { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { RouterStore } from 'mobx-react-router';
import { sleep } from '../../helpers/async-helpers';
import SetupAssistant from '../../components/auth/SetupAssistant';
import ServicesStore from '../../stores/ServicesStore';
import RecipesStore from '../../stores/RecipesStore';
import UserStore from '../../stores/UserStore';

interface IProps {
  stores: {
    services?: ServicesStore,
    router: RouterStore,
    recipes?: RecipesStore,
    user?: UserStore,
  },
  actions: {
    user: UserStore,
    service: ServicesStore,
    recipe: RecipesStore,
  },
};

class SetupAssistantScreen extends Component<IProps> {
  state = {
    isSettingUpServices: false,
  }

  // TODO: Why are these hardcoded here? Do they need to conform to specific services in the packaged recipes? If so, its more important to fix this
  services = {
    whatsapp: {
      name: 'WhatsApp',
      hasTeamId: false,
    },
    messenger: {
      name: 'Messenger',
      hasTeamId: false,
    },
    gmail: {
      name: 'Gmail',
      hasTeamId: false,
    },
    skype: {
      name: 'Skype',
      hasTeamId: false,
    },
    telegram: {
      name: 'Telegram',
      hasTeamId: false,
    },
    instagram: {
      name: 'Instagram',
      hasTeamId: false,
    },
    slack: {
      name: 'Slack',
      hasTeamId: true,
    },
    hangouts: {
      name: 'Hangouts',
      hasTeamId: false,
    },
    linkedin: {
      name: 'LinkedIn',
      hasTeamId: false,
    },
  };

  async setupServices(serviceConfig) {
    const { stores: { services, router } } = this.props;

    this.setState({
      isSettingUpServices: true,
    });

    // The store requests are not build for parallel requests so we need to finish one request after another
    for (const config of serviceConfig) {
      const serviceData = {
        name: this.services[config.id].name,
        team: config.team
      };

      await services._createService({
        recipeId: config.id,
        serviceData,
        redirect: false,
        skipCleanup: true,
      });

      await sleep(100);
    }

    this.setState({
      isSettingUpServices: false,
    });

    await sleep(100);

    router.push('/');
  }

  render() {
    return (
      <SetupAssistant
        onSubmit={config => this.setupServices(config)}
        services={this.services}
        embed={false}
        isSettingUpServices={this.state.isSettingUpServices}
      />
    );
  }
}

export default inject('stores', 'actions')(observer(SetupAssistantScreen));
