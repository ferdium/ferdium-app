import { webFrame } from 'electron';

import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import { RouterStore } from '@superwf/mobx-react-router';
import { createHashHistory } from 'history';

import ServerApi from './api/server/ServerApi';
import LocalApi from './api/server/LocalApi';
import storeFactory from './stores';
import apiFactory from './api';
import actions from './actions';
import MenuFactory from './lib/Menu';
import TouchBarFactory from './lib/TouchBar';

import I18N from './I18n';
import FerdiumRoutes from './routes';

// Basic electron Setup
webFrame.setVisualZoomLevelLimits(1, 1);

window.addEventListener('load', () => {
  const serverApi = new ServerApi();
  const api = apiFactory(serverApi, new LocalApi());
  const history = createHashHistory();
  const router = new RouterStore(history);
  // @ts-ignore - Need to provide proper typings for actions
  const stores = storeFactory(api, actions, router);
  const menu = new MenuFactory(stores, actions);
  const touchBar = new TouchBarFactory(stores, actions);

  window['ferdium'] = {
    stores,
    actions,
    api,
    menu,
    touchBar,
    features: {},
    render() {
      const preparedApp = (
        <Provider stores={stores} actions={actions}>
          <I18N stores={{ app: stores.app, user: stores.user }}>
            <FerdiumRoutes history={history} />
          </I18N>
        </Provider>
      );
      render(preparedApp, document.querySelector('#root'));
    },
  };
  window['ferdium'].render();
});

// Prevent back and forward mouse events for the app itself (not inside the recipe)
// TODO: send this request to the recipe.js
window.addEventListener('mouseup', e => {
  if (e.button === 3 || e.button === 4) {
    e.preventDefault();
    e.stopPropagation();
  }
});

// Prevent drag and drop into window from redirecting
window.addEventListener('dragover', event => event.preventDefault());
window.addEventListener('drop', event => event.preventDefault());
window.addEventListener('dragover', event => event.stopPropagation());
window.addEventListener('drop', event => event.stopPropagation());
