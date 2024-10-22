import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
      style={{ width: '100%' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
      }}
    >
      <Button
        variant="outlined"
        startIcon={<AddCircleIcon />}
        onClick={handleAddTab}
        sx={{
          width: 'fit-content',
          display: 'flex',
          margin: '8px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {intl.formatMessage(messages.addCustomSandbox)}
      </Button>

      <Box
        sx={{
          flexGrow: 1,
          // bgcolor: 'background.paper',
          display: sandboxServices.length === 0 ? 'none' : 'flex',
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
            minWidth: '20%',
            maxWidth: '20%',
          }}
        >
          {sandboxServices?.map((tab, index) => (
            <Tab key={tab.id} label={tab.name} {...a11yProps(index)} />
          ))}
        </Tabs>
        {sandboxServices?.map((tab, index) => (
          <TabPanel key={`${tab.id}-tabpanel`} value={value} index={index}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                id={`text-${tab.id}`}
                variant="outlined"
                value={tab.name}
                onChange={e => {
                  editSandboxService({ id: tab.id, name: e.target.value });
                }}
              />
              <IconButton
                onClick={() => {
                  deleteSandboxService({ id: tab.id });
                  setValue(value ? value - 1 : 0);
                }}
                aria-label="delete"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <SandboxTransferList
              value={value}
              actions={actions}
              stores={stores}
            />
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}

export default inject('stores', 'actions')(observer(SandboxServiceTabs));
