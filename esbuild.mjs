#!/usr/bin/env node
import { build, serve } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import { copy } from 'esbuild-plugin-copy';
import glob from 'tiny-glob';
import livereload from 'gulp-livereload';
import * as fs from 'fs';
import * as buildInfo from 'preval-build-info';
import fsPkg from 'fs-extra';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import moment from 'moment';

const { log } = console;

const outDir = 'build';

const staticAssets = () => [
  copy({
    assets: {
      from: ['./src/internal-server/**/*.{json,ini,edge,css,png,sqlite}'],
      to: ['./internal-server'],
    },
  }),
  copy({
    assets: {
      from: ['./src/internal-server/ace'],
      to: ['./internal-server'],
    },
  }),
  copy({
    assets: {
      from: ['./recipes/archives/*.tar.gz'],
      to: ['./recipes'],
    },
  }),
  copy({
    assets: {
      from: ['./recipes/*.json'],
      to: ['./recipes'],
    },
  }),
  copy({
    assets: {
      from: ['./src/**/*.json'],
      to: ['./'],
    },
  }),
  copy({
    assets: {
      from: ['./src/assets/**'],
      to: ['./assets'],
    },
  }),
  copy({
    assets: {
      from: ['./src/index.html'],
      to: ['./'],
    },
  }),
];

const copyManualAssets = async () => {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  fs.copyFileSync('package.json', `${outDir}/package.json`);
  fs.copyFileSync('electron-builder.npmrc', `${outDir}/.npmrc`);

  const buildInfoData = {
    timestamp: buildInfo.timestamp,
    gitHashShort: buildInfo.gitHashShort,
    gitBranch: buildInfo.gitBranch,
  };
  await fsPkg.outputJson(`${outDir}/buildInfo.json`, buildInfoData);
};

const runEsbuild = async () => {
  const startTime = performance.now();

  let watch = false;
  let isDev = false;

  const myArgs = process.argv.slice(2);
  if (myArgs.includes('--watch')) {
    watch = true;
    isDev = true;
  }
  log(chalk.blue(`Starting with args`), myArgs);

  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { force: true, recursive: true });
    log(chalk.blue(`Cleaning`), outDir);
  }
  await copyManualAssets();

  // Source files
  const entryPoints = await glob('./src/**/*.{ts,tsx,js,jsx}');

  // Scss entry points
  entryPoints.push(
    'src/styles/main.scss',
    'src/styles/vertical.scss',
    'src/styles/animations.scss',
  );

  // Run build
  await build({
    entryPoints,
    format: 'cjs',
    minify: false,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    keepNames: true,
    outdir: outDir,
    watch: isDev &&
      watch && {
        onRebuild(error, result) {
          if (error) {
            log(chalk.red(`watch build failed: ${error}`));
          } else {
            log(chalk.blue(`watch build success:`), result);
            livereload.reload();
          }
        },
      },
    incremental: isDev && watch,
    plugins: [sassPlugin(), ...staticAssets()],
  });

  if (watch) {
    const serveResult = await serve(
      {
        servedir: outDir,
        port: 8080,
      },
      {},
    );
    log(chalk.green(`Listening on ${serveResult.host}:${serveResult.port}`));
    livereload.listen();
  } else {
    const endTime = performance.now();
    const duration = endTime - startTime;
    log(
      chalk.green(`Completed build in ${moment(duration).format('ss.m')}sec`),
    );
  }
};

runEsbuild();
