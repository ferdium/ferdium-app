interface ServiceWithUrl {
  url: string;
}

/**
 * What Ferdium knows about a service that a recipe can use to decide whether a
 * link belongs to it.
 */
export interface LinkContext {
  url: string;
  team: string;
  linkContext: Record<string, string>;
}

interface ServiceWithRecipe extends ServiceWithUrl {
  team: string;
  linkContext: Record<string, string>;
  recipe: {
    resolveLink?: (link: string, context: LinkContext) => string | null;
  };
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

/**
 * Finds the service that should open the given link and the url it should load.
 * The recipe of a service decides first, so it can claim app links like slack://
 * or rewrite a url; otherwise the service with the same host opens the url as is.
 */
export function resolveServiceLink<Service extends ServiceWithRecipe>(
  services: Service[],
  link: string,
): { service: Service; url: string } | undefined {
  for (const service of services) {
    const url = service.recipe.resolveLink?.(link, {
      url: service.url,
      team: service.team,
      linkContext: service.linkContext,
    });

    if (url) {
      return { service, url };
    }
  }

  const service = findServiceForUrl(services, link);

  return service ? { service, url: link } : undefined;
}

// Protocols Ferdium must never take over: the web itself and its own deep links
const RESERVED_PROTOCOLS = new Set([
  'http',
  'https',
  'file',
  'ferdium',
  'ferdium-dev',
]);

/**
 * The app link protocols (e.g. slack) the recipes of the given services can open,
 * each listed once.
 */
export function getAppLinkProtocols(
  services: { recipe: { protocols: string[] } }[],
): string[] {
  const protocols = services.flatMap(service => service.recipe.protocols);

  return [...new Set(protocols)].filter(
    protocol => !RESERVED_PROTOCOLS.has(protocol),
  );
}
