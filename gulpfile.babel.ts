import gulp from 'gulp';
import gulpIf from 'gulp-if';
import babel from 'gulp-babel';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import csso from 'gulp-csso';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
import htmlMin from 'gulp-htmlmin';
import connect from 'gulp-connect';
import sassVariables from 'gulp-sass-variables';
import { removeSync, outputJson } from 'fs-extra';
import kebabCase from 'kebab-case';
import hexRgb from 'hex-rgb';
import ts from 'gulp-typescript';

import * as buildInfo from 'preval-build-info';
import config from './package.json';

import rawStyleConfig from './scripts/theme/default/legacy';

import 'dotenv/config';

const sass = gulpSass(dartSass);

const isDevBuild = process.env.NODE_ENV === 'development';

const getTargetEnv = isDevBuild ? 'development' : 'production';

const tsProject = ts.createProject('tsconfig.json');

const styleConfig = Object.keys(rawStyleConfig).map(key => {
  const isHex = /^#[\da-f]{6}$/i.test(rawStyleConfig[key]);
  return {
    [`$raw_${kebabCase(key)}`]: isHex
      ? hexRgb(rawStyleConfig[key], { format: 'array' }).splice(0, 3).join(',')
      : rawStyleConfig[key],
  };
});

const paths = {
  src: 'src',
  dest: 'build',
  tmp: '.tmp',
  dist: 'out',
  package: `out/${config.version}`,
  buildInfoDestFile: 'build/buildInfo.json',
  recipes: {
    src: 'recipes/archives/*.tar.gz',
    dest: 'build/recipes/',
  },
  recipeInfo: {
    src: 'recipes/*.json',
    dest: 'build/recipes/',
  },
  html: {
    src: 'src/**/*.html',
    dest: 'build/',
    watch: 'src/**/*.html',
  },
  styles: {
    src: [
      'src/styles/main.scss',
      'src/styles/vertical.scss',
      'src/styles/animations.scss',
    ],
    dest: 'build/styles',
    watch: 'src/styles/**/*.scss',
  },
  javascript: {
    src: ['src/**/*.js', 'src/**/*.jsx'],
    dest: 'build/',
    watch: ['src/**/*.js', 'src/**/*.jsx'],
  },
  typescript: {
    src: ['src/**/*.ts', 'src/**/*.tsx'],
    dest: 'build/',
    watch: ['src/**/*.ts', 'src/**/*.tsx'],
  },
};

const clean: (done: any) => void = done => {
  removeSync(paths.tmp);
  removeSync(paths.dest);
  removeSync(paths.dist);

  done();
};

function mvSrc() {
  return gulp
    .src(
      [
        `${paths.src}/*`,
        `${paths.src}/*/**`,
        `!${paths.javascript.watch[0]}`,
        `!${paths.typescript.watch[0]}`,
        `!${paths.src}/styles/**`,
      ],
      { since: gulp.lastRun(mvSrc) },
    )
    .pipe(gulp.dest(paths.dest));
}

function mvElectronNpmrc() {
  return gulp
    .src(['electron-builder.npmrc'])
    .pipe(rename('.npmrc'))
    .pipe(gulp.dest(paths.dest));
}

function mvPackageJson() {
  return gulp.src(['./package.json']).pipe(gulp.dest(paths.dest));
}

function BuildInfo() {
  const buildInfoData = {
    timestamp: buildInfo.timestamp,
    gitHashShort: buildInfo.gitHashShort,
    gitBranch: buildInfo.gitBranch,
  };
  return outputJson(paths.buildInfoDestFile, buildInfoData);
}

function html() {
  return gulp
    .src(paths.html.src, { since: gulp.lastRun(html) })
    .pipe(
      gulpIf(
        !isDevBuild,
        htmlMin({
          // Only minify in production to speed up dev builds
          collapseWhitespace: true,
          removeComments: true,
        }),
      ),
    )
    .pipe(gulp.dest(paths.html.dest))
    .pipe(connect.reload());
}

function styles(): NodeJS.ReadWriteStream {
  return gulp
    .src(paths.styles.src)
    .pipe(
      sassVariables(
        Object.assign(
          {
            $env: getTargetEnv,
          },
          ...styleConfig,
        ),
      ),
    )
    .pipe(
      sass({
        includePaths: ['./node_modules', '../node_modules'],
      }).on('error', sass.logError),
    )
    .pipe(
      gulpIf(
        !isDevBuild,
        csso({
          // Only minify in production to speed up dev builds
          restructure: false, // Don't restructure CSS, otherwise it will break the styles
        }),
      ),
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(connect.reload());
}

function processJavascript() {
  return gulp
    .src(paths.javascript.src, { since: gulp.lastRun(processJavascript) })
    .pipe(
      babel({
        comments: false,
      }),
    )
    .pipe(gulpIf(!isDevBuild, terser())) // Only uglify in production to speed up dev builds
    .pipe(gulp.dest(paths.javascript.dest))
    .pipe(connect.reload());
}

function processTypescript() {
  return gulp
    .src(paths.typescript.src, { since: gulp.lastRun(processTypescript) })
    .pipe(tsProject())
    .js.pipe(
      babel({
        comments: false,
      }),
    )
    .pipe(gulpIf(!isDevBuild, terser())) // Only uglify in production to speed up dev builds
    .pipe(gulp.dest(paths.typescript.dest))
    .pipe(connect.reload());
}

function watch() {
  gulp.watch(paths.styles.watch, styles);

  gulp.watch([paths.src], mvSrc);

  gulp.watch(paths.javascript.watch, processJavascript);
  gulp.watch(paths.typescript.watch, processTypescript);
}

function webserver() {
  connect.server({
    root: paths.dest,
    livereload: true,
  });
}

function recipes() {
  return gulp
    .src(paths.recipes.src, { since: gulp.lastRun(recipes) })
    .pipe(gulp.dest(paths.recipes.dest));
}

function recipeInfo() {
  return gulp
    .src(paths.recipeInfo.src, { since: gulp.lastRun(recipeInfo) })
    .pipe(gulp.dest(paths.recipeInfo.dest));
}

export const build = gulp.series(
  clean,
  gulp.parallel(mvElectronNpmrc, mvSrc, mvPackageJson, BuildInfo),
  gulp.parallel(
    html,
    processJavascript,
    processTypescript,
    styles,
    recipes,
    recipeInfo,
  ),
);

export const dev = gulp.series(build, gulp.parallel(webserver, watch));
