import type { Actions } from '../actions/lib/actions';
import type { RealStores } from '../stores';

export interface StoresProps {
  actions: Actions;
  stores: RealStores;
}

export interface GlobalError {
  status?: number;
  message?: string;
  code?: string;
}
