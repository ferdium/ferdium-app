import { autorun, observable } from 'mobx';
import { session } from '@electron/remote';

// TODO: Go back to 'debug' from 'console.log' when https://github.com/electron/electron/issues/31689 is fixed
// const debug = require('debug')('Ferdium:feature:serviceProxy');

export const config = observable({
  isEnabled: true,
});

export default function init(stores: {
  services: { enabled: any };
  settings: { proxy: any };
}) {
  console.log('Initializing `serviceProxy` feature');

  autorun(() => {
    config.isEnabled = true;

    const services = stores.services.enabled;
    const proxySettings = stores.settings.proxy;

    console.log('Service Proxy autorun');

    for (const service of services) {
      const s = session.fromPartition(`persist:service-${service.id}`);

      if (config.isEnabled) {
        const serviceProxyConfig = proxySettings[service.id];

        if (
          serviceProxyConfig &&
          serviceProxyConfig.isEnabled &&
          serviceProxyConfig.host
        ) {
          const proxyHost = `${serviceProxyConfig.host}${
            serviceProxyConfig.port ? `:${serviceProxyConfig.port}` : ''
          }`;
          console.log(
            `Setting proxy config from service settings for "${service.name}" (${service.id}) to`,
            proxyHost,
          );

          s.setProxy({ proxyRules: proxyHost })
            .then(() => {
              console.log(
                `Using proxy "${proxyHost}" for "${service.name}" (${service.id})`,
              );
            })
            .catch(error => console.error(error));
        }
      }
    }
  });
}
