import { observable } from 'mobx';

export { default as Component } from './Component';

const debug = require('debug')('Ferdi:feature:quickSwitch');

const defaultState = {
  isModalVisible: false,
};

export const state = observable(defaultState);

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
