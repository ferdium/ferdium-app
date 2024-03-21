import PropTypes from 'prop-types';
import type { ActionDefinitions } from './lib/actions';

export default <ActionDefinitions>{
  setBadge: {
    unreadDirectMessageCount: PropTypes.number.isRequired,
    unreadIndirectMessageCount: PropTypes.number,
  },
  notify: {
    title: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
    serviceId: PropTypes.string,
  },
  launchOnStartup: {
    enable: PropTypes.bool.isRequired,
  },
  openExternalUrl: {
    url: PropTypes.string.isRequired,
  },
  checkForUpdates: {},
  resetUpdateStatus: {},
  installUpdate: {},
  healthCheck: {},
  muteApp: {
    isMuted: PropTypes.bool.isRequired,
    overrideSystemMute: PropTypes.bool,
  },
  toggleMuteApp: {},
  toggleCollapseMenu: {},
  clearAllCache: {},
  addDownload: {},
  removeDownload: {},
  updateDownload: {},
  endedDownload: {},
  stopDownload: {},
  togglePauseDownload: {},
};
