import {
  action,
  computed,
  IReactionPublic,
  makeObservable,
  observable,
} from 'mobx';
import { Actions } from '../../actions/lib/actions';
import { ApiInterface } from '../../api';
import { Stores } from '../../@types/stores.types';
import Reaction from './Reaction';

export default abstract class TypedStore {
  _reactions: Reaction[] = [];

  @observable _status: any = null;

  stores: Stores;

  api: ApiInterface;

  actions: Actions;

  @action _setResetStatus() {
    this._status = null;
  }

  @computed get actionStatus() {
    return this._status || [];
  }

  set actionStatus(status) {
    this._status = status;
  }

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    makeObservable(this);

    this.stores = stores;
    this.api = api;
    this.actions = actions;
  }

  registerReactions(reactions: { (r: IReactionPublic): void }[]): void {
    for (const reaction of reactions) {
      this._reactions.push(new Reaction(reaction));
    }
  }

  public abstract setup(): void;

  initialize(): void {
    this.setup();
    for (const reaction of this._reactions) reaction.start();
  }

  teardown(): void {
    for (const reaction of this._reactions) reaction.stop();
  }

  resetStatus(): void {
    this._setResetStatus();
  }
}
