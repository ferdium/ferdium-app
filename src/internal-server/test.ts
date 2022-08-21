import { join } from 'path';
import { ensureDirSync } from 'fs-extra';
import { server } from './start';

const dummyUserFolder = join(__dirname, 'user_data');

ensureDirSync(dummyUserFolder);

server(dummyUserFolder, 46_568, 'test').catch(console.log);
