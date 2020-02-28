import { observable } from 'mobx';

export { default as Component } from './Component';

const debug = require('debug')('Ferdi:feature:publishDebugInfo');

const defaultState = {
  isModalVisible: false,
};

export const state = observable(defaultState);

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
