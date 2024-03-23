import type Reaction from '../../stores/lib/Reaction';

export default class FeatureStore {
  _actions: any = [];

  _reactions: Reaction[] = [];

  stop() {
    this._stopActions();
    this._stopReactions();
  }

  // ACTIONS
  _registerActions(actions) {
    this._actions = actions;
    this._startActions();
  }

  _startActions(actions = this._actions) {
    for (const action of actions) {
      action.start();
    }
  }

  _stopActions(actions = this._actions) {
    for (const action of actions) {
      action.stop();
    }
  }

  // REACTIONS
  _registerReactions(reactions) {
    this._reactions = reactions;
    this._startReactions();
  }

  _startReactions(reactions = this._reactions) {
    for (const reaction of reactions) {
      reaction.start();
    }
  }

  _stopReactions(reactions = this._reactions) {
    for (const reaction of reactions) {
      reaction.stop();
    }
  }
}
