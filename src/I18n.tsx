import { Component, ReactNode } from 'react';
import { inject, observer } from 'mobx-react';
import { IntlProvider } from 'react-intl';

import { generatedTranslations } from './i18n/translations';
import UserStore from './stores/UserStore';
import AppStore from './stores/AppStore';

const translations = generatedTranslations();

type Props = {
  stores: {
    app: AppStore;
    user: typeof UserStore;
  };
  children: ReactNode;
};

class I18N extends Component<Props> {
  componentDidUpdate() {
    window['ferdium'].menu.rebuild();
  }

  render(): ReactNode {
    const { stores, children } = this.props;
    const { locale } = stores.app;
    return (
      <IntlProvider
        {...{ locale, key: locale, messages: translations[locale] }}
        ref={intlProvider => {
          window['ferdium'].intl = intlProvider
            ? intlProvider.state.intl
            : null;
        }}
      >
        {children}
      </IntlProvider>
    );
  }
}

export default inject('stores')(observer(I18N));
