import { Actions } from '../actions/lib/actions';
import { RealStores } from '../stores';

export interface StoresProps {
  actions: Actions;
  stores: RealStores;
}

export interface GlobalError {
  status?: number;
  message?: string;
  code?: string;
}
