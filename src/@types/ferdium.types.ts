declare global {
  interface Window {
    ferdium: any;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_AUTH_TOKEN: string;
      NODE_ENV: 'development' | 'production';
      FERDIUM_APPDATA_DIR?: string;
      PORTABLE_EXECUTABLE_FILE?: string;
      PORTABLE_EXECUTABLE_DIR?: string;
      ELECTRON_IS_DEV?: string;
      APPDATA?: string;
    }
  }
}

/**
 * Workaround to make TS recognize this file as a module.
 * https://fettblog.eu/typescript-augmenting-global-lib-dom/
 */
export type {};
