import { exec } from 'child_process';

const log = (err, stdout, stderr) => console.log(err || stdout || stderr);

if (!process.env.BUNDLING) {
  exec('npx lerna run build', log);
}
