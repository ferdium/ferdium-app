import RouteParser from 'route-parser';

export default function matchRoute(pattern: string, path: string) {
  return new RouteParser(pattern).match(path);
}
