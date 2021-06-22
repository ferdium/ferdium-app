import { state as ModalState } from './store';

export { default as Component } from './Component';

const state = ModalState;
const debug = require('debug')('Ferdi:feature:publishDebugInfo');

export default function initialize() {
  debug('Initialize publishDebugInfo feature');

  function showModal() {
    state.isModalVisible = true;
  }

  window.ferdi.features.publishDebugInfo = {
    state,
    showModal,
  };
}
