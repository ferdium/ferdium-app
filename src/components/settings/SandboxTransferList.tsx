import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// import Paper from '@mui/material/Paper';
import { inject, observer } from 'mobx-react';
import { useState } from 'react';
import type { StoresProps } from '../../@types/ferdium-components.types';

function not(a: readonly string[], b: readonly string[]) {
  return a.filter(value => !b.includes(value));
}

function intersection(a: readonly string[], b: readonly string[]) {
  return a.filter(value => b.includes(value));
}

interface ISandboxTransferListProps extends StoresProps {
  value: number;
}

function SandboxTransferList(props: ISandboxTransferListProps) {
  const { value, actions, stores } = props;

  const { editSandboxService } = actions.app;

  const { sandboxServices } = stores.app;
  const { all: allServices } = stores.services;

  const selectedServices = sandboxServices[value].services;

  // Create a Set to keep track of unique not selected services
  const notSelectedSet = new Set<string>();

  // Loop through all services and check if they are in any sandbox's selected services
  allServices.forEach(service => {
    let isSelected = false;

    sandboxServices.forEach(sandbox => {
      if (sandbox.services.includes(service.id)) {
        isSelected = true;
      }
    });

    // If the service is not selected in any sandbox service, add it to the Set
    if (!isSelected) {
      notSelectedSet.add(service.id);
    }
  });

  // Convert the Set to an array
  const notSelected = [...notSelectedSet];

  const [checked, setChecked] = useState<readonly string[]>([]);
  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const sandboxId = sandboxServices[value].id;

  const leftChecked = intersection(checked, selectedServices);
  const rightChecked = intersection(checked, notSelected);

  const getServiceInfo = (id: string) => {
    const service = allServices.find(s => s.id === id);
    if (!service) {
      return null;
    }
    return service;
  };

  const customList = (items: readonly string[]) => (
    // <Paper sx={{ width: 200, height: 230, overflow: 'auto' }}>
    <List
      dense
      component="div"
      role="list"
      key={`${sandboxId}-${value}-transferlist`}
    >
      {items.map((value: string) => {
        const labelId = `transfer-list-item-${value}-label`;

        return (
          <ListItemButton
            key={`${sandboxId}-${value}-li`}
            role="listitem"
            onClick={handleToggle(value)}
          >
            <ListItemIcon
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Checkbox
                checked={checked.includes(value)}
                tabIndex={-1}
                disableRipple
                inputProps={{
                  'aria-labelledby': labelId,
                }}
              />
              <img
                src={getServiceInfo(value)?.icon}
                alt={getServiceInfo(value)?.name}
                width={15}
                height={15}
              />
            </ListItemIcon>
            <ListItemText id={labelId} primary={getServiceInfo(value)?.name} />
          </ListItemButton>
        );
      })}
    </List>
    // </Paper>
  );

  function handleAllRight() {
    editSandboxService({
      id: sandboxId,
      services: [],
    });
    setChecked([]);
  }

  function handleCheckedRight() {
    editSandboxService({
      id: sandboxId,
      services: not(selectedServices, leftChecked),
    });
    setChecked(not(checked, leftChecked));
  }

  function handleCheckedLeft() {
    editSandboxService({
      id: sandboxId,
      services: [...selectedServices, ...rightChecked],
    });
    setChecked(not(checked, rightChecked));
  }

  function handleAllLeft() {
    editSandboxService({
      id: sandboxId,
      services: [...selectedServices, ...notSelected],
    });
    setChecked([]);
  }

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid item>{customList(selectedServices)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={() => handleAllLeft()}
            disabled={notSelected.length === 0}
            aria-label="move all left"
          >
            ≪
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={() => handleCheckedLeft()}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>

          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={() => handleCheckedRight()}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={() => handleAllRight()}
            disabled={selectedServices.length === 0}
            aria-label="move all right"
          >
            ≫
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList(notSelected)}</Grid>
    </Grid>
  );
}

export default inject('stores', 'actions')(observer(SandboxTransferList));
