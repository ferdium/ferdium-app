import { Actions } from 'src/actions/lib/actions';
import { RealStores } from 'src/stores';

export interface DefaultProps {
  actions: Actions;
  stores: RealStores;
}

export interface GlobalError {
  status: number;
  message: string;
  code: string;
}
