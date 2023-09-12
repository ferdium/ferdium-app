import { ipcRenderer } from 'electron';
import { safeParseInt } from '../jsUtils';

export default class BadgeHandler {
  setBadge(
    direct: string | number | undefined | null,
    indirect: string | number | undefined | null,
  ) {
    const count = {
      direct: safeParseInt(direct),
      indirect: safeParseInt(indirect),
    };

    ipcRenderer.sendToHost('message-counts', count);
  }
}
