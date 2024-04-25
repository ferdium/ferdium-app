import { inject, observer } from 'mobx-react';
import { Component, type ReactNode } from 'react';
import { IntlProvider } from 'react-intl';

import generatedTranslations from './i18n/translations';
import type AppStore from './stores/AppStore';
import type UserStore from './stores/UserStore';

const translations = generatedTranslations();

interface Props {
  stores: {
    app: AppStore;
    user: UserStore;
  };
  children: ReactNode;
}

class I18N extends Component<Props> {
  componentDidUpdate(): void {
    window['ferdium'].menu.rebuild();
  }

  render(): ReactNode {
    const { stores, children } = this.props;
    const { locale } = stores.app;

    return (
      <IntlProvider
        locale={locale}
        key={locale}
        messages={translations[locale]}
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
