import { state as ModalState } from './store';

export { default as Component } from './Component';

const state = ModalState;
const debug = require('../../preload-safe-debug')(
  'Ferdium:feature:publishDebugInfo',
);

export default function initialize() {
  debug('Initialize publishDebugInfo feature');

  function showModal() {
    state.isModalVisible = true;
  }

  window['ferdium'].features.publishDebugInfo = {
    state,
    showModal,
  };
}
