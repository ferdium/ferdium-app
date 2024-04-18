import { join } from 'node:path';
import { ensureDirSync } from 'fs-extra';
import { server } from './start';

const dummyUserFolder = join(__dirname, 'user_data');

ensureDirSync(dummyUserFolder);

// eslint-disable-next-line unicorn/prefer-top-level-await, no-console
server(dummyUserFolder, 46_568, 'test').catch(console.log);
