import { observer } from 'mobx-react';
import { Component } from 'react';
import { SortableContainer } from 'react-sortable-hoc';

import type Service from '../../../models/Service';
import TabItem from './TabItem';

interface IProps {
  showMessageBadgeWhenMutedSetting: boolean;
  showServiceNameSetting: boolean;
  showMessageBadgesEvenWhenMuted: boolean;
  services: Service[];
  setActive: (args: { serviceId: string }) => void;
  openSettings: (args: { path: string }) => void;
  reload: (args: { serviceId: string }) => void;
  toggleNotifications: (args: { serviceId: string }) => void;
  toggleAudio: (args: { serviceId: string }) => void;
  toggleDarkMode: (args: { serviceId: string }) => void;
  deleteService: (args: { serviceId: string }) => void;
  clearCache: (args: { serviceId: string }) => void;
  disableService: (args: { serviceId: string }) => void;
  enableService: (args: { serviceId: string }) => void;
  hibernateService: (args: { serviceId: string }) => void;
  wakeUpService: (args: { serviceId: string }) => void;
}

@observer
class TabBarSortableList extends Component<IProps> {
  render() {
    const {
      services,
      setActive,
      reload,
      toggleNotifications,
      toggleAudio,
      toggleDarkMode,
      deleteService,
      clearCache,
      disableService,
      enableService,
      hibernateService,
      wakeUpService,
      openSettings,
      showMessageBadgeWhenMutedSetting,
      showServiceNameSetting,
      showMessageBadgesEvenWhenMuted,
    } = this.props;

    return (
      <ul className="tabs">
        {services.map((service, index) => (
          <TabItem
            key={service.id}
            // @ts-expect-error Fix me
            clickHandler={() => setActive({ serviceId: service.id })}
            service={service}
            index={index}
            shortcutIndex={index + 1}
            reload={() => reload({ serviceId: service.id })}
            toggleNotifications={() =>
              toggleNotifications({ serviceId: service.id })
            }
            toggleAudio={() => toggleAudio({ serviceId: service.id })}
            toggleDarkMode={() => toggleDarkMode({ serviceId: service.id })}
            deleteService={() => deleteService({ serviceId: service.id })}
            clearCache={() => clearCache({ serviceId: service.id })}
            disableService={() => disableService({ serviceId: service.id })}
            enableService={() => enableService({ serviceId: service.id })}
            hibernateService={() => hibernateService({ serviceId: service.id })}
            wakeUpService={() => wakeUpService({ serviceId: service.id })}
            openSettings={openSettings}
            showMessageBadgeWhenMutedSetting={showMessageBadgeWhenMutedSetting}
            showMessageBadgesEvenWhenMuted={showMessageBadgesEvenWhenMuted}
            showServiceNameSetting={showServiceNameSetting}
          />
        ))}
      </ul>
    );
  }
}

export default SortableContainer(TabBarSortableList);
