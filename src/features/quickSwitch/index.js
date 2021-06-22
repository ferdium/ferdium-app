import { state as ModalState } from './store';

export { default as Component } from './Component';
const state = ModalState;

const debug = require('debug')('Ferdi:feature:quickSwitch');

export default function initialize() {
  debug('Initialize quickSwitch feature');

  function showModal() {
    state.isModalVisible = true;
  }

  window.ferdi.features.quickSwitch = {
    state,
    showModal,
  };
}
