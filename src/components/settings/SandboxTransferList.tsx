import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  ListItemButton,
  Paper,
  Typography,
} from '@mui/material';
import { inject, observer } from 'mobx-react';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import type { StoresProps } from '../../@types/ferdium-components.types';

function not(a: readonly string[], b: readonly string[]) {
  return a.filter(value => !b.includes(value));
}

function intersection(a: readonly string[], b: readonly string[]) {
  return a.filter(value => b.includes(value));
}

const messages = defineMessages({
  serviceAssignmentInfo: {
    id: 'sandbox.serviceAssignmentInfo',
    defaultMessage:
      'Choose which services should share this sandbox. A service can belong to only one custom sandbox.',
  },
  availableServices: {
    id: 'sandbox.availableServices',
    defaultMessage: 'Available services',
  },
  sandboxServices: {
    id: 'sandbox.sandboxServices',
    defaultMessage: 'In this sandbox',
  },
  noAvailableServices: {
    id: 'sandbox.noAvailableServices',
    defaultMessage: 'No unassigned services available.',
  },
  noSandboxServices: {
    id: 'sandbox.noSandboxServices',
    defaultMessage: 'No services have been added yet.',
  },
  addAll: {
    id: 'sandbox.addAll',
    defaultMessage: 'Add all',
  },
  addSelected: {
    id: 'sandbox.addSelected',
    defaultMessage: 'Add selected',
  },
  removeSelected: {
    id: 'sandbox.removeSelected',
    defaultMessage: 'Remove selected',
  },
  removeAll: {
    id: 'sandbox.removeAll',
    defaultMessage: 'Remove all',
  },
});

interface ISandboxTransferListProps extends StoresProps {
  value: number;
}

function SandboxTransferList(props: ISandboxTransferListProps) {
  const { value, actions, stores } = props;
  const intl = useIntl();

  const { editSandboxService } = actions.app;
  const { sandboxServices } = stores.app;
  const { all: allServices } = stores.services;
  const sandbox = sandboxServices[value];

  const [checked, setChecked] = useState<readonly string[]>([]);

  if (!sandbox) {
    return null;
  }

  const selectedServices = sandbox.services;

  // Services can only belong to one custom sandbox at a time.
  const assignedServiceIds = new Set(
    sandboxServices.flatMap(item => item.services),
  );
  const availableServices = allServices
    .filter(service => !assignedServiceIds.has(service.id))
    .map(service => service.id);

  const handleToggle = (serviceId: string) => () => {
    const currentIndex = checked.indexOf(serviceId);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(serviceId);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const sandboxId = sandbox.id;
  const selectedChecked = intersection(checked, selectedServices);
  const availableChecked = intersection(checked, availableServices);

  const getServiceInfo = (id: string) =>
    allServices.find(item => item.id === id) ?? null;

  const customList = (
    items: readonly string[],
    title: string,
    emptyMessage: string,
  ) => (
    <Paper
      variant="outlined"
      sx={{
        minWidth: 0,
        width: '100%',
        height: 'auto',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 1,
          height: 30,
          minHeight: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 0.75,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {title}
        </Typography>
        <Chip size="small" label={items.length} sx={{ height: 22 }} />
      </Box>
      <Divider />

      {items.length === 0 ? (
        <Box
          sx={{
            height: 168,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 1,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <Box
          role="list"
          sx={{
            height: 168,
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'contain',
            py: 0.25,
            // Match Ferdium's existing .settings__body scrollbar styling.
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: 'none',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme =>
                theme.palette.mode === 'dark'
                  ? 'rgb(71, 73, 75)'
                  : 'rgb(236, 238, 239)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:window-inactive': {
              background: 'none',
            },
          }}
        >
          {items.map(serviceId => {
            const service = getServiceInfo(serviceId);
            const serviceName = service?.name ?? serviceId;
            const isChecked = checked.includes(serviceId);

            return (
              <ListItemButton
                role="listitem"
                key={`${sandboxId}-${serviceId}`}
                selected={isChecked}
                onClick={handleToggle(serviceId)}
                sx={{
                  width: '100%',
                  height: 32,
                  minHeight: 32,
                  px: 0.5,
                  py: 0,
                  gap: 0.5,
                  flex: '0 0 32px',
                  boxSizing: 'border-box',
                  color: 'text.primary',
                }}
              >
                <Checkbox
                  checked={isChecked}
                  tabIndex={-1}
                  disableRipple
                  size="small"
                  sx={{ p: 0.5, flexShrink: 0 }}
                  inputProps={{ 'aria-label': serviceName }}
                />
                {service?.icon && (
                  <Box
                    component="img"
                    src={service.icon}
                    alt=""
                    sx={{
                      width: 18,
                      height: 18,
                      objectFit: 'contain',
                      flexShrink: 0,
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ minWidth: 0, color: 'text.primary' }}
                >
                  {serviceName}
                </Typography>
              </ListItemButton>
            );
          })}
        </Box>
      )}
    </Paper>
  );

  function handleRemoveAll() {
    editSandboxService({
      id: sandboxId,
      services: [],
    });
    setChecked([]);
  }

  function handleRemoveSelected() {
    editSandboxService({
      id: sandboxId,
      services: not(selectedServices, selectedChecked),
    });
    setChecked(not(checked, selectedChecked));
  }

  function handleAddSelected() {
    editSandboxService({
      id: sandboxId,
      services: [...selectedServices, ...availableChecked],
    });
    setChecked(not(checked, availableChecked));
  }

  function handleAddAll() {
    editSandboxService({
      id: sandboxId,
      services: [...selectedServices, ...availableServices],
    });
    setChecked([]);
  }

  return (
    <Box sx={{ containerType: 'inline-size', minWidth: 0, height: 'auto' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {intl.formatMessage(messages.serviceAssignmentInfo)}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          height: 'auto',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 1,
          '@container (min-width: 340px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        {customList(
          availableServices,
          intl.formatMessage(messages.availableServices),
          intl.formatMessage(messages.noAvailableServices),
        )}

        {customList(
          selectedServices,
          intl.formatMessage(messages.sandboxServices),
          intl.formatMessage(messages.noSandboxServices),
        )}

        <Box
          sx={{
            display: 'grid',
            height: 'auto',
            gridTemplateColumns: '1fr 1fr',
            gap: 0.5,
            '@container (min-width: 340px)': {
              gridColumn: '1 / -1',
            },
            '& .MuiButton-root': {
              minWidth: 0,
              px: 0.75,
              whiteSpace: 'nowrap',
            },
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={handleAddAll}
            disabled={availableServices.length === 0}
          >
            {intl.formatMessage(messages.addAll)}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleAddSelected}
            disabled={availableChecked.length === 0}
          >
            {intl.formatMessage(messages.addSelected)}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRemoveSelected}
            disabled={selectedChecked.length === 0}
          >
            {intl.formatMessage(messages.removeSelected)}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRemoveAll}
            disabled={selectedServices.length === 0}
          >
            {intl.formatMessage(messages.removeAll)}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
export default inject('stores', 'actions')(observer(SandboxTransferList));
