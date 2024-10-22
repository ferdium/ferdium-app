import { cpus } from 'node:os';
import macosVersion from 'macos-version';
import { chrome } from 'useragent-generator';
import {
  chromeVersion,
  is64Bit,
  isMac,
  isWindows,
  osArch,
  osRelease,
} from '../environment';

const macOS = () => {
  const version = macosVersion() ?? '';
  let cpuName = cpus()[0].model.split(' ')[0];
  if (cpuName.includes('(')) {
    // eslint-disable-next-line prefer-destructuring
    cpuName = cpuName.split('(')[0];
  }
  return `Macintosh; ${cpuName} macOS ${version.replaceAll('.', '_')}`;
};

const windows = () => {
  const version = osRelease;
  const [majorVersion, minorVersion] = version.split('.');
  const archString = is64Bit ? 'Win64' : 'Win32';
  return `Windows NT ${majorVersion}.${minorVersion}; ${archString}; ${osArch}`;
};

const linux = () => {
  const archString = is64Bit ? 'x86_64' : osArch;
  return `X11; Linux ${archString}`;
};

export default function userAgent() {
  let platformString;

  if (isMac) {
    platformString = macOS();
  } else if (isWindows) {
    platformString = windows();
  } else {
    platformString = linux();
  }

  return chrome({ os: platformString, version: chromeVersion });
}
