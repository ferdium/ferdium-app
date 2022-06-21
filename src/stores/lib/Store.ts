import { computed, IReactionPublic, observable } from 'mobx';
import { Actions } from 'src/actions/lib/actions';
import { ApiInterface } from 'src/api';
import { Stores } from 'src/stores.types';
import Reaction from './Reaction';

export default abstract class Store {
  // status implementation
  stores: Stores;

  api: ApiInterface;

  actions: Actions;

  _reactions: Reaction[] = [];

  @observable _status: any = null;

  @computed get actionStatus() {
    return this._status || [];
  }

  set actionStatus(status) {
    this._status = status;
  }

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
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
    this._status = null;
  }
}
