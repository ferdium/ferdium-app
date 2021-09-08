import { autorun } from 'mobx';
import { session } from '@electron/remote';

const debug = require('debug')('Ferdi:feature:serviceProxy');

export default function init(stores) {
  debug('Initializing `serviceProxy` feature');

  autorun(() => {
    const services = stores.services.enabled;
    const proxySettings = stores.settings.proxy;

    debug('Service Proxy autorun');

    services.forEach((service) => {
      const serviceProxyConfig = proxySettings[service.id];
      if (serviceProxyConfig && serviceProxyConfig.isEnabled && serviceProxyConfig.host) {
        const proxyHost = `${serviceProxyConfig.host}${serviceProxyConfig.port ? `:${serviceProxyConfig.port}` : ''}`;
        debug(`Setting proxy config from service settings for "${service.name}" (${service.id}) to`, proxyHost);

        session.fromPartition(`persist:service-${service.id}`).setProxy({ proxyRules: proxyHost }, () => {
          debug(`Using proxy "${proxyHost}" for "${service.name}" (${service.id})`);
        });
      }
    });
  });
}
