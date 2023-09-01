import { Component } from 'react';
import { observer } from 'mobx-react';
import { IntlShape, defineMessages, injectIntl } from 'react-intl';
import { ipcRenderer } from 'electron';
import prettyBytes from 'pretty-bytes';
import {
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Box,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
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
          {downloads.length === 0 ? (
            <Typography variant="h6">Your download list is empty</Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                height: 'fit-content',
              }}
            >
              <Box
                sx={{
                  maxWidth: '176px',
                }}
              >
                <ListItemButton
                  onClick={() => {
                    // TODO: Add clear all completed downloads from list
                  }}
                >
                  <ListItemIcon>
                    <ClearAllIcon />
                  </ListItemIcon>
                  <ListItemText primary="Clear all completed" />
                </ListItemButton>
              </Box>
            </Box>
          )}
          {downloads.map(download => {
            const {
              totalBytes,
              receivedBytes,
              filename,
              url,
              savePath,
              state,
              id,
            } = download;

            const downloadPercentage =
              receivedBytes !== undefined && totalBytes !== undefined
                ? Math.round((receivedBytes / totalBytes) * 100)
                : null;

            const stateParse =
              state === 'progressing' || state === 'completed'
                ? null
                : state === 'interrupted'
                ? 'Paused'
                : state === 'cancelled'
                ? 'Cancelled'
                : 'Error';

            return (
              <Card
                key={id}
                style={{
                  marginBottom: '16px',
                  height: 'fit-content',
                  display: 'flex',
                }}
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: stateParse ? 'line-through' : null,
                        }}
                      >
                        {filename}
                      </Typography>
                      <Typography variant="h6">
                        {stateParse ? `, ${stateParse}` : null}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{url}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={downloadPercentage || 0}
                      style={{ marginTop: '8px', marginBottom: '8px' }}
                    />
                    <Typography variant="body2">
                      {`${
                        downloadPercentage ? `${downloadPercentage}%  - ` : ''
                      }${
                        receivedBytes ? `${prettyBytes(receivedBytes)} of ` : ''
                      }${totalBytes ? prettyBytes(totalBytes) : ''}`}
                    </Typography>
                  </CardContent>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px',
                  }}
                >
                  {state !== 'completed' && state !== 'cancelled' && (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        ipcRenderer.send('stop-download', {
                          downloadId: id,
                        });
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  )}
                  {(state === 'cancelled' || state === 'completed') && (
                    <IconButton
                      color="error"
                      onClick={() => {
                        // TODO: action remove from list
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  {state !== 'cancelled' && (
                    <IconButton
                      color="primary"
                      onClick={() => {
                        ipcRenderer.send('open-file', {
                          filePath: savePath,
                        });
                      }}
                      size="small"
                    >
                      <FolderIcon />
                    </IconButton>
                  )}
                </Box>
              </Card>
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
