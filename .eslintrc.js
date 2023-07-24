/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  ignorePatterns: ['node_modules', 'build', 'recipes'],
  extends: [
    'airbnb',
    'plugin:jest/recommended',
    'plugin:unicorn/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['jest'],
  settings: {
    react: {
      pragma: 'React', // Pragma to use, default to "React"
      version: 'detect', // React version. "detect" automatically picks the version you have installed.
    },
  },
  globals: {
    use: true,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  reportUnusedDisableDirectives: true,
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'airbnb-typescript',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/strict',
        // TODO: Opt-in to a stricter ruleset in the future
        // 'plugin:@typescript-eslint/strict-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
      ],
      parser: '@typescript-eslint/parser',
      plugins: [],
      rules: {
        // @typescript-eslint
        // This is necessary as workaround for window.ferdium vs window['ferdium']
        '@typescript-eslint/dot-notation': 0,
        '@typescript-eslint/indent': 0,
        '@typescript-eslint/no-shadow': 0,
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-inferrable-types': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/prefer-nullish-coalescing': 0,
        '@typescript-eslint/consistent-indexed-object-style': 0,
        '@typescript-eslint/consistent-type-assertions': 0,
        '@typescript-eslint/consistent-type-definitions': 0,
        '@typescript-eslint/no-empty-interface': 0,

        // eslint-plugin-import
        'import/no-extraneous-dependencies': 0, // various false positives, re-enable at some point
      },
    },
  ],
  rules: {
    // eslint
    'array-callback-return': 1,
    'class-methods-use-this': 0,
    'consistent-return': 1,
    // TODO: Turn this rule on once the js to ts conversions are over
    // This is necessary as workaround for window.ferdium vs window['ferdium']
    'no-await-in-loop': 1,
    'no-return-assign': 1,
    'no-console': [
      1,
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-param-reassign': 1,
    'no-restricted-syntax': 0,
    'no-underscore-dangle': 0,
    'prefer-destructuring': 1,
    // eslint-plugin-import
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'import/no-unresolved': 0,
    'import/no-cycle': 1,
    'import/no-extraneous-dependencies': 0, // various false positives, re-enable at some point
    // eslint-plugin-react
    'react/forbid-prop-types': 1,
    'react/destructuring-assignment': 0,
    'react/react-in-jsx-scope': 0,
    'react/jsx-filename-extension': 1,
    'react/jsx-one-expression-per-line': 0,
    'react/jsx-no-bind': 1,
    'react/jsx-props-no-spreading': 0,
    'react/prefer-stateless-function': 1,
    'react/prop-types': 0,
    'react/static-property-placement': 0,
    'react/state-in-constructor': 1,
    'react/sort-comp': 0,
    'react/function-component-definition': 0,
    'react/jsx-no-useless-fragment': 0,
    // TODO: [TS DEBT] should remove below config once application converted to TS
    'react/default-props-match-prop-types': 0,
    'react/require-default-props': 0,
    'react/button-has-type': 0,
    'react/no-unused-prop-types': 1,
    'react/no-deprecated': 1,
    // eslint-plugin-jsx-a11y
    'jsx-a11y/click-events-have-key-events': 1,
    'jsx-a11y/no-static-element-interactions': 1,
    'jsx-a11y/no-noninteractive-element-interactions': 1,
    'jsx-a11y/label-has-for': [
      2,
      {
        components: ['Label'],
        required: {
          every: ['id'],
        },
        allowChildren: false,
      },
    ],
    // eslint-plugin-unicorn
    'unicorn/filename-case': 0,
    'unicorn/no-null': 0,
    'unicorn/no-useless-undefined': 0,
    'unicorn/prefer-module': 0,
    'unicorn/prevent-abbreviations': 0,
    'unicorn/prefer-node-protocol': 0,
    'unicorn/import-style': [
      2,
      {
        styles: {
          path: {
            named: true,
          },
        },
      },
    ],
    'unicorn/consistent-destructuring': 0,
    // INFO: Turned off due to src/internal-server/database/factory.js
    'unicorn/no-empty-file': 0,
  },
};
