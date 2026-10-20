interface ServiceWithUrl {
  url: string;
}

function parseHttpUrl(value: string): URL | undefined {
  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }

    return url;
  } catch {
    return undefined;
  }
}

/**
 * Finds the service that should open the given http(s) url: the first service
 * whose own address has the same host.
 */
export function findServiceForUrl<Service extends ServiceWithUrl>(
  services: Service[],
  url: string,
): Service | undefined {
  const host = parseHttpUrl(url)?.hostname;

  if (!host) {
    return undefined;
  }

  return services.find(service => parseHttpUrl(service.url)?.hostname === host);
}
