import { observer } from 'mobx-react';
import { Component } from 'react';

import type Service from '../../../models/Service';
import TabBarSortableList from './TabBarSortableList';

interface IProps {
  useHorizontalStyle: boolean;
  showMessageBadgeWhenMutedSetting: boolean;
  showServiceNameSetting: boolean;
  showMessageBadgesEvenWhenMuted: boolean;
  services: Service[];
  setActive: (args: { serviceId: string }) => void;
  openSettings: (args: { path: string }) => void;
  enableToolTip: () => void;
  disableToolTip: () => void;
  reorder: (args: { oldIndex: number; newIndex: number }) => void;
  reload: (args: { serviceId: string }) => void;
  toggleNotifications: (args: { serviceId: string }) => void;
  toggleAudio: (args: { serviceId: string }) => void;
  toggleDarkMode: (args: { serviceId: string }) => void;
  deleteService: (args: { serviceId: string }) => void;
  clearCache: (args: { serviceId: string }) => void;
  hibernateService: (args: { serviceId: string }) => void;
  wakeUpService: (args: { serviceId: string }) => void;
  updateService: (args: {
    serviceId: string;
    serviceData: { isEnabled: boolean; isMediaPlaying: boolean };
    redirect: boolean;
  }) => void;
}

@observer
class TabBar extends Component<IProps> {
  onSortEnd = ({ oldIndex, newIndex }) => {
    const { enableToolTip, reorder } = this.props;

    enableToolTip();
    reorder({ oldIndex, newIndex });
  };

  shouldPreventSorting = event => event.target.tagName !== 'LI';

  toggleService = (args: { serviceId: string; isEnabled: boolean }) => {
    const { updateService } = this.props;

    if (args.serviceId) {
      updateService({
        serviceId: args.serviceId,
        serviceData: {
          isEnabled: args.isEnabled,
          isMediaPlaying: false,
        },
        redirect: false,
      });
    }
  };

  disableService({ serviceId }) {
    this.toggleService({ serviceId, isEnabled: false });
  }

  enableService({ serviceId }) {
    this.toggleService({ serviceId, isEnabled: true });
  }

  hibernateService({ serviceId }) {
    if (serviceId) {
      this.props.hibernateService({ serviceId });
    }
  }

  wakeUpService({ serviceId }) {
    if (serviceId) {
      this.props.wakeUpService({ serviceId });
    }
  }

  render() {
    const {
      services,
      setActive,
      openSettings,
      disableToolTip,
      reload,
      toggleNotifications,
      toggleAudio,
      toggleDarkMode,
      deleteService,
      clearCache,
      useHorizontalStyle,
      showMessageBadgeWhenMutedSetting,
      showServiceNameSetting,
      showMessageBadgesEvenWhenMuted,
    } = this.props;

    const axis = useHorizontalStyle ? 'x' : 'y';

    return (
      <div>
        <TabBarSortableList
          // @ts-expect-error Fix me
          services={services}
          setActive={setActive}
          onSortEnd={this.onSortEnd}
          onSortStart={disableToolTip}
          shouldCancelStart={this.shouldPreventSorting}
          reload={reload}
          toggleNotifications={toggleNotifications}
          toggleAudio={toggleAudio}
          toggleDarkMode={toggleDarkMode}
          deleteService={deleteService}
          clearCache={clearCache}
          disableService={args => this.disableService(args)}
          enableService={args => this.enableService(args)}
          hibernateService={args => this.hibernateService(args)}
          wakeUpService={args => this.wakeUpService(args)}
          openSettings={openSettings}
          distance={20}
          axis={axis}
          lockAxis={axis}
          helperClass="is-reordering"
          showMessageBadgeWhenMutedSetting={showMessageBadgeWhenMutedSetting}
          showServiceNameSetting={showServiceNameSetting}
          showMessageBadgesEvenWhenMuted={showMessageBadgesEvenWhenMuted}
        />
      </div>
    );
  }
}

export default TabBar;
