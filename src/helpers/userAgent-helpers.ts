import { cpus } from 'os';
import macosVersion from 'macos-version';
import { chrome } from 'useragent-generator';
import {
  chromeVersion,
  isMac,
  isWindows,
  is64Bit,
  osArch,
  osRelease,
} from '../environment';

function macOS() {
  const version = macosVersion() || '';
  let cpuName = cpus()[0].model.split(' ')[0];
  if (cpuName && /\(/.test(cpuName)) {
    cpuName = cpuName.split('(')[0];
  }
  return `Macintosh; ${cpuName} Mac OS X ${version.replaceAll('.', '_')}`;
}

function windows() {
  const version = osRelease;
  const [majorVersion, minorVersion] = version.split('.');
  const archString = is64Bit ? 'Win64' : 'Win32';
  return `Windows NT ${majorVersion}.${minorVersion}; ${archString}; ${osArch}`;
}

function linux() {
  const archString = is64Bit ? 'x86_64' : osArch;
  return `X11; Linux ${archString}`;
}

export default function userAgent() {
  let platformString = '';

  if (isMac) {
    platformString = macOS();
  } else if (isWindows) {
    platformString = windows();
  } else {
    platformString = linux();
  }

  return chrome({ os: platformString, version: chromeVersion });
}
