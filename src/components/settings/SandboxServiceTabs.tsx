import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { inject, observer } from 'mobx-react';
import { type ReactNode, type SyntheticEvent, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import type { StoresProps } from '../../@types/ferdium-components.types';
import SandboxTransferList from './SandboxTransferList';

const debug = require('../../preload-safe-debug')('Ferdium:Settings');

const messages = defineMessages({
  addCustomSandbox: {
    id: 'sandbox.addCustomSandbox',
    defaultMessage: 'Add a custom sandbox',
  },
  customSandboxes: {
    id: 'sandbox.customSandboxes',
    defaultMessage: 'Custom sandboxes',
  },
  customSandboxesInfo: {
    id: 'sandbox.customSandboxesInfo',
    defaultMessage:
      'Group only the services that need to share sign-in or site data.',
  },
  emptyTitle: {
    id: 'sandbox.emptyTitle',
    defaultMessage: 'No custom sandboxes yet',
  },
  emptyDescription: {
    id: 'sandbox.emptyDescription',
    defaultMessage:
      'Create one when two or more services need to share data. Unassigned services stay isolated.',
  },
  sandboxName: {
    id: 'sandbox.sandboxName',
    defaultMessage: 'Sandbox name',
  },
  deleteSandbox: {
    id: 'sandbox.deleteSandbox',
    defaultMessage: 'Delete sandbox',
  },
});

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{ width: '100%', minWidth: 0, height: 'auto' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 2, height: 'auto' }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

interface IProps extends StoresProps {}

function SandboxServiceTabs(props: IProps) {
  const [value, setValue] = useState(0);

  const intl = useIntl();

  const { stores, actions } = props;

  const { sandboxServices } = stores.app;
  const { addSandboxService, editSandboxService, deleteSandboxService } =
    actions.app;

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    debug('handleChange', event, newValue);
    setValue(newValue);
  };

  const handleAddTab = () => {
    addSandboxService();
    setValue(sandboxServices.length - 1);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        gap: 2,
        mt: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          height: 'auto',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
        }}
      >
        <Box sx={{ height: 'auto' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {intl.formatMessage(messages.customSandboxes)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {intl.formatMessage(messages.customSandboxesInfo)}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<AddCircleIcon />}
          onClick={handleAddTab}
          sx={{ width: { xs: '100%', sm: 'fit-content' }, flexShrink: 0 }}
        >
          {intl.formatMessage(messages.addCustomSandbox)}
        </Button>
      </Box>

      {sandboxServices.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            px: 3,
            py: 4,
            textAlign: 'center',
            borderStyle: 'dashed',
            height: 'auto',
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {intl.formatMessage(messages.emptyTitle)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.75, maxWidth: 520, mx: 'auto' }}
          >
            {intl.formatMessage(messages.emptyDescription)}
          </Typography>
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            flexGrow: 1,
            display: 'flex',
            height: 'auto',
            minHeight: 360,
            overflow: 'hidden',
          }}
        >
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs sandbox"
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              width: 180,
              flexShrink: 0,
              bgcolor: 'action.hover',
              '& .MuiTab-root': {
                alignItems: 'stretch',
                minHeight: 52,
                maxWidth: 'none',
                px: 1.5,
                textTransform: 'none',
              },
            }}
          >
            {sandboxServices.map((tab, index) => (
              <Tab
                key={tab.id}
                label={
                  <Box
                    sx={{
                      display: 'flex',
                      height: 'auto',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      width: '100%',
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      noWrap
                      sx={{ minWidth: 0 }}
                    >
                      {tab.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={tab.services.length}
                      sx={{ height: 22, flexShrink: 0 }}
                    />
                  </Box>
                }
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
          {sandboxServices.map((tab, index) => (
            <TabPanel key={`${tab.id}-tabpanel`} value={value} index={index}>
              <Box
                sx={{
                  display: 'flex',
                  height: 'auto',
                  alignItems: 'center',
                  gap: 1,
                  maxWidth: 520,
                }}
              >
                <TextField
                  id={`text-${tab.id}`}
                  label={intl.formatMessage(messages.sandboxName)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  value={tab.name}
                  onChange={e => {
                    editSandboxService({ id: tab.id, name: e.target.value });
                  }}
                />
                <Tooltip title={intl.formatMessage(messages.deleteSandbox)}>
                  <IconButton
                    onClick={() => {
                      deleteSandboxService({ id: tab.id });
                      setValue(value ? value - 1 : 0);
                    }}
                    aria-label={intl.formatMessage(messages.deleteSandbox)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <SandboxTransferList
                value={value}
                actions={actions}
                stores={stores}
              />
            </TabPanel>
          ))}
        </Paper>
      )}
    </Box>
  );
}

export default inject('stores', 'actions')(observer(SandboxServiceTabs));
