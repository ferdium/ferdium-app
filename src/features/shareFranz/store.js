import { observable } from 'mobx';

const defaultState = {
  isModalVisible: false,
  lastShown: null,
};

export const state = observable(defaultState);
