import { Component } from 'react';
import { observer } from 'mobx-react';
import { IntlShape, defineMessages, injectIntl } from 'react-intl';
import { ipcRenderer, shell } from 'electron';
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
import { Actions } from '../../actions/lib/actions';

const messages = defineMessages({
  headline: {
    id: 'downloadManager.headline',
    defaultMessage: 'Download Manager',
  },
});

interface IProps {
  intl: IntlShape;
  stores?: RealStores;
  actions?: Actions;
}

interface IState {
  data: string;
}

// eslint-disable-next-line react/prefer-stateless-function
class DownloadManagerDashboard extends Component<IProps, IState> {
  render() {
    const { intl, stores, actions } = this.props;

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
                    actions?.app.removeDownload(null);
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
                      <button
                        type="button"
                        disabled={state !== 'completed'}
                        style={{
                          pointerEvents:
                            state === 'completed' ? undefined : 'none',
                        }}
                        onClick={() => {
                          if (savePath) shell.openPath(savePath);
                        }}
                      >
                        <Typography
                          variant="h6"
                          color={state === 'completed' ? 'primary' : undefined}
                          sx={{
                            textDecoration: stateParse
                              ? 'line-through'
                              : state === 'completed'
                              ? 'underline'
                              : null,
                          }}
                        >
                          {filename}
                        </Typography>
                      </button>
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
                        actions?.app.removeDownload(id);
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
                        if (savePath) shell.showItemInFolder(savePath);
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
