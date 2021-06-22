import { observable } from 'mobx';

const defaultState = {
  isModalVisible: false,
};

export const state = observable(defaultState);
