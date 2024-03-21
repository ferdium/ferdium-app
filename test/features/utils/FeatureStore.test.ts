import { observable } from 'mobx';
import PropTypes from 'prop-types';
import { createActionsFromDefinitions } from '../../../src/actions/lib/actions';
import { createActionBindings } from '../../../src/features/utils/ActionBinding';
import FeatureStore from '../../../src/features/utils/FeatureStore';
import { createReactions } from '../../../src/stores/lib/Reaction';

const actions: any = createActionsFromDefinitions(
  {
    countUp: {},
  },
  PropTypes.checkPropTypes,
);

class TestFeatureStore extends FeatureStore {
  @observable count = 0;

  reactionInvokedCount = 0;

  start() {
    this._registerActions(
      createActionBindings([[actions.countUp, this._countUp]]),
    );
    this._registerReactions(createReactions([this._countReaction]));
  }

  _countUp = () => {
    this.count += 1;
  };

  _countReaction = () => {
    this.reactionInvokedCount += 1;
  };
}

describe('FeatureStore', () => {
  let store: any = null;

  beforeEach(() => {
    store = new TestFeatureStore();
  });

  describe('registering actions', () => {
    it('starts the actions', () => {
      store.start();
      actions.countUp();
      expect(store.count).toBe(1);
    });
    it('starts the reactions', () => {
      store.start();
      actions.countUp();
      expect(store.reactionInvokedCount).toBe(1);
    });
  });

  describe('stopping the store', () => {
    it('stops the actions', () => {
      store.start();
      actions.countUp();
      store.stop();
      actions.countUp();
      expect(store.count).toBe(1);
    });
    it('stops the reactions', () => {
      store.start();
      actions.countUp();
      store.stop();
      store.count += 1;
      expect(store.reactionInvokedCount).toBe(1);
    });
  });

  describe('toggling the store', () => {
    it('restarts the actions correctly', () => {
      store.start();
      actions.countUp();
      store.stop();
      actions.countUp();
      store.start();
      actions.countUp();
      expect(store.count).toBe(2);
    });
    it('restarts the reactions correctly', () => {
      store.start();
      actions.countUp();
      store.stop();
      actions.countUp();
      store.start();
      actions.countUp();
      expect(store.count).toBe(2);
    });
  });
});
