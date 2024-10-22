import { Octokit } from '@octokit/core';
import { type IntlShape, defineMessages } from 'react-intl';

export const getFerdiumVersion = (
  currentLocation: string,
  ferdiumVersion: string,
): string => {
  const matches = currentLocation.match(/version=([^&]*)/);
  if (matches !== null) {
    return `v${matches[1]}`;
  }
  return `v${ferdiumVersion}`;
};

export const updateVersionParse = (updateVersion: string): string => {
  return updateVersion === '' ? '' : `?version=${updateVersion}`;
};

export const onAuthGoToReleaseNotes = (
  currentLocation: string,
  updateVersionParsed: string = '',
): string => {
  return currentLocation.includes('#/auth')
    ? `#/auth/releasenotes${updateVersionParsed}`
    : `#/releasenotes${updateVersionParsed}`;
};

const messages = defineMessages({
  connectionError: {
    id: 'settings.releasenotes.connectionError',
    defaultMessage:
      'An error occurred when connecting to Github, please try again later.',
  },
  connectionErrorPageMissing: {
    id: 'settings.releasenotes.connectionErrorPageMissing',
    defaultMessage:
      'An error occurred when connecting to Github, the page you are looking for is missing.',
  },
});

export async function getUpdateInfoFromGH(
  currentLocation: string,
  ferdiumVersion: string,
  intl: IntlShape,
): Promise<string> {
  const octokit = new Octokit();
  try {
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/releases/tags/{tag}',
      {
        owner: 'ferdium',
        repo: 'ferdium-app',
        tag: getFerdiumVersion(currentLocation, ferdiumVersion),
      },
    );

    if (response.status === 200) {
      const json = response.data.body;
      return json || `### ${intl.formatMessage(messages.connectionError)}`;
    }
    return `### ${intl.formatMessage(messages.connectionError)}`;
  } catch {
    return `### ${intl.formatMessage(messages.connectionErrorPageMissing)}`;
  }
}
