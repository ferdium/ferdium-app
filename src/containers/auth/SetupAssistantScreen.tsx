import { inject, observer } from 'mobx-react';
import ms from 'ms';
import { Component, type ReactElement } from 'react';
import type { StoresProps } from '../../@types/ferdium-components.types';
import type { ILegacyServices } from '../../@types/legacy-types';
import SetupAssistant from '../../components/auth/SetupAssistant';
import sleep from '../../helpers/async-helpers';

interface IProps extends StoresProps {}

interface IState {
  isSettingUpServices: boolean;
}

@inject('stores', 'actions')
@observer
class SetupAssistantScreen extends Component<IProps, IState> {
  services: ILegacyServices;

  constructor(props: IProps) {
    super(props);

    this.state = {
      isSettingUpServices: false,
    };

    // TODO: Why are these hardcoded here? Do they need to conform to specific services in the packaged recipes? If so, its more important to fix this
    this.services = {
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
  }

  async setupServices(serviceConfig: any): Promise<void> {
    const { services, router } = this.props.stores;

    this.setState({ isSettingUpServices: true });

    // The store requests are not build for parallel requests so we need to finish one request after another
    for (const config of serviceConfig) {
      // eslint-disable-next-line no-await-in-loop
      await services._createService({
        recipeId: config.id,
        serviceData: {
          name: this.services[config.id].name,
          team: config.team,
        },
        redirect: false,
        skipCleanup: true,
      });

      // eslint-disable-next-line no-await-in-loop
      await sleep(ms('100ms'));
    }

    this.setState({ isSettingUpServices: false });
    await sleep(ms('100ms'));
    router.push('/');
  }

  render(): ReactElement {
    return (
      <SetupAssistant
        onSubmit={config => this.setupServices(config)}
        services={this.services}
        // embed={false} // TODO: [TS DEBT][PROP NOT USED IN COMPONENT] check legacy services type
        isSettingUpServices={this.state.isSettingUpServices}
      />
    );
  }
}

export default SetupAssistantScreen;
