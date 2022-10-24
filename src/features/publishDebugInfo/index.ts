import { state } from './store';

export { default as Component } from './Component';

const debug = require('../../preload-safe-debug')(
  'Ferdium:feature:publishDebugInfo',
);

export default function initialize(): void {
  debug('Initialize publishDebugInfo feature');

  const showModal = (): void => {
    state.isModalVisible = true;
  };

  window['ferdium'].features.publishDebugInfo = { state, showModal };
}
