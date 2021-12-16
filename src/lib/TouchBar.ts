import semver from 'semver';
import { TouchBar, getCurrentWindow } from '@electron/remote';
import { autorun } from 'mobx';

import { isMac, osRelease } from '../environment';

export default class FranzTouchBar {
  stores: any;

  actions: any;

  build: any;

  constructor(stores: any, actions: any) {
    this.stores = stores;
    this.actions = actions;

    // Temporary fix for https://github.com/electron/electron/issues/10442
    // TODO: remove when we upgrade to electron 1.8.2 or later
    try {
      if (isMac && semver.gt(osRelease, '16.6.0')) {
        this.build = autorun(this._build.bind(this));
      }
    } catch (error) {
      console.error(error);
    }
  }

  _build() {
    const currentWindow = getCurrentWindow();

    if (this.stores.user.isLoggedIn) {
      const { TouchBarButton, TouchBarSpacer } = TouchBar;

      const buttons: any[] = [];
      for (const service of this.stores.services.allDisplayed) {
        buttons.push(
          new TouchBarButton({
            label: `${service.name}${
              service.unreadDirectMessageCount > 0 ? ' 🔴' : ''
            } ${
              service.unreadDirectMessageCount === 0 &&
              service.unreadIndirectMessageCount > 0
                ? ' ⚪️'
                : ''
            }`,
            backgroundColor: service.isActive && '#3498DB',
            click: () => {
              this.actions.service.setActive({ serviceId: service.id });
            },
          }),
          new TouchBarSpacer({ size: 'small' }),
        );
      }

      const touchBar = new TouchBar({ items: buttons });
      currentWindow.setTouchBar(touchBar);
    } else {
      currentWindow.setTouchBar(null);
    }
  }
}
