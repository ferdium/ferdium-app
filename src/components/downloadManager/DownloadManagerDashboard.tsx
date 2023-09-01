import { Component } from 'react';
import { observer } from 'mobx-react';
import { IntlShape, defineMessages, injectIntl } from 'react-intl';
import { ipcRenderer } from 'electron';
import { mdiCancel } from '@mdi/js';
import Icon from '../ui/icon';
import { RealStores } from '../../stores';

const messages = defineMessages({
  headline: {
    id: 'downloadManager.headline',
    defaultMessage: 'Download Manager',
  },
});

interface IProps {
  intl: IntlShape;
  stores?: RealStores;
}

interface IState {
  data: string;
}

// eslint-disable-next-line react/prefer-stateless-function
class DownloadManagerDashboard extends Component<IProps, IState> {
  render() {
    const { intl, stores } = this.props;

    const downloads = stores?.app.downloads ?? [];

    return (
      <div className="settings__main">
        <div className="settings__header">
          <span className="settings__header-item">
            {intl.formatMessage(messages.headline)}
          </span>
        </div>
        <div className="settings__body">
          {downloads.map(download => {
            return (
              <div>
                <span>{download.filename}</span>
                <span>
                  {download.receivedBytes?.toString()}/
                  {download.totalBytes?.toString()}
                </span>
                <span>{download.state}</span>
                <button
                  type="button"
                  onClick={() => {
                    ipcRenderer.send('stop-download', {
                      downloadId: download.id,
                    });
                  }}
                >
                  <Icon icon={mdiCancel} size={1.5} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default injectIntl(observer(DownloadManagerDashboard));

// {downloadProgress !== null && (
//   <div
//     className="download-progress"
//     style={{
//       width: '-webkit-fill-available',
//       height: 'fit-content',
//       display: 'flex',
//       justifyContent: 'center',
//       margin: 5,
//     }}
//   >
//     <Circle
//       percent={downloadPercentage}
//       strokeWidth={10}
//       strokeColor="#008000"
//       trailColor="grey"
//     />
//   </div>
// )}
