import { ipcRenderer } from 'electron';
import jwt from 'jsonwebtoken';
import { action, computed, makeObservable, observable } from 'mobx';
import localStorage from 'mobx-localstorage';
import moment from 'moment';

import type { Stores } from '../@types/stores.types';
import type { Actions } from '../actions/lib/actions';
import type { ApiInterface } from '../api';
import { TODOS_PARTITION_ID } from '../config';
import { isDevMode } from '../environment-remote';
import CachedRequest from './lib/CachedRequest';
import Request from './lib/Request';
import TypedStore from './lib/TypedStore';

const debug = require('../preload-safe-debug')('Ferdium:UserStore');

// TODO: split stores into UserStore and AuthStore
export default class UserStore extends TypedStore {
  BASE_ROUTE: string = '/auth';

  WELCOME_ROUTE: string = `${this.BASE_ROUTE}/welcome`;

  LOGIN_ROUTE: string = `${this.BASE_ROUTE}/login`;

  LOGOUT_ROUTE: string = `${this.BASE_ROUTE}/logout`;

  SIGNUP_ROUTE: string = `${this.BASE_ROUTE}/signup`;

  SETUP_ROUTE: string = `${this.BASE_ROUTE}/signup/setup`;

  IMPORT_ROUTE: string = `${this.BASE_ROUTE}/signup/import`;

  INVITE_ROUTE: string = `${this.BASE_ROUTE}/signup/invite`;

  PASSWORD_ROUTE: string = `${this.BASE_ROUTE}/password`;

  CHANGE_SERVER_ROUTE: string = `${this.BASE_ROUTE}/server`;

  @observable loginRequest: Request = new Request(this.api.user, 'login');

  @observable signupRequest: Request = new Request(this.api.user, 'signup');

  @observable passwordRequest: Request = new Request(this.api.user, 'password');

  @observable inviteRequest: Request = new Request(this.api.user, 'invite');

  @observable getUserInfoRequest: CachedRequest = new CachedRequest(
    this.api.user,
    'getInfo',
  );

  @observable requestNewTokenRequest: CachedRequest = new CachedRequest(
    this.api.user,
    'requestNewToken',
  );

  @observable updateUserInfoRequest: Request = new Request(
    this.api.user,
    'updateInfo',
  );

  @observable deleteAccountRequest: CachedRequest = new CachedRequest(
    this.api.user,
    'delete',
  );

  @observable isImportLegacyServicesExecuting: boolean = false;

  @observable isImportLegacyServicesCompleted: boolean = false;

  @observable isLoggingOut: boolean = false;

  @observable id: string | null | undefined;

  @observable authToken: string | null =
    localStorage.getItem('authToken') || null;

  @observable accountType: string | undefined;

  @observable hasCompletedSignup: boolean = false;

  @observable userData: object = {};

  logoutReasonTypes = {
    SERVER: 'SERVER',
  };

  @observable logoutReason: string | null = null;

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    // Register action handlers
    this.actions.user.login.listen(this._login.bind(this));
    this.actions.user.retrievePassword.listen(
      this._retrievePassword.bind(this),
    );
    this.actions.user.logout.listen(this._logout.bind(this));
    this.actions.user.signup.listen(this._signup.bind(this));
    this.actions.user.invite.listen(this._invite.bind(this));
    this.actions.user.update.listen(this._update.bind(this));
    this.actions.user.resetStatus.listen(this._resetStatus.bind(this));
    this.actions.user.importLegacyServices.listen(
      this._importLegacyServices.bind(this),
    );
    this.actions.user.delete.listen(this._delete.bind(this));

    // Reactions
    this.registerReactions([
      this._requireAuthenticatedUser.bind(this),
      this._getUserData.bind(this),
    ]);
  }

  setup(): void {
    // Data migration
    this._migrateUserLocale();
  }

  // Routes
  get loginRoute(): string {
    return this.LOGIN_ROUTE;
  }

  get signupRoute(): string {
    return this.SIGNUP_ROUTE;
  }

  get passwordRoute(): string {
    return this.PASSWORD_ROUTE;
  }

  get changeServerRoute(): string {
    return this.CHANGE_SERVER_ROUTE;
  }

  // Data
  @computed get isLoggedIn(): boolean {
    return Boolean(localStorage.getItem('authToken'));
  }

  @computed get isTokenExpired(): boolean {
    if (!this.authToken) return false;
    const parsedToken = this._parseToken(this.authToken);

    return (
      parsedToken !== false &&
      this.authToken !== null &&
      moment(parsedToken.tokenExpiry).isBefore(moment())
    );
  }

  @computed get data() {
    if (!this.isLoggedIn) return {};

    const newTokenNeeded = this._shouldRequestNewToken(this.authToken);
    if (newTokenNeeded) {
      this._requestNewToken();
    }

    return this.getUserInfoRequest.execute().result || {};
  }

  @computed get team(): any {
    return this.data.team || null;
  }

  // Actions
  @action async _login({ email, password }): Promise<void> {
    const authToken = await this.loginRequest.execute(email, password).promise;
    this._setUserData(authToken);

    this.stores.router.push('/');
  }

  @action _tokenLogin(authToken: string): void {
    this._setUserData(authToken);

    this.stores.router.push('/');
  }

  @action async _signup({
    firstname,
    lastname,
    email,
    password,
    accountType,
    company,
    plan,
    currency,
  }): Promise<void> {
    // TODO: [TS DEBT] Need to find a way proper to implement promise's then and catch in request class
    // @ts-expect-error Fix me
    const authToken = await this.signupRequest.execute({
      firstname,
      lastname,
      email,
      password,
      accountType,
      company,
      locale: this.stores.app.locale,
      plan,
      currency,
    });

    this.hasCompletedSignup = true;

    this._setUserData(authToken);

    this.stores.router.push(this.SETUP_ROUTE);
  }

  @action async _retrievePassword({ email }): Promise<void> {
    const request = this.passwordRequest.execute(email);

    await request.promise;
    this.actionStatus = request.result.status || [];
  }

  @action async _invite({ invites }): Promise<void> {
    const data = invites.filter(invite => invite.email !== '');

    const response = await this.inviteRequest.execute(data).promise;

    this.actionStatus = response.status || [];

    // we do not wait for a server response before redirecting the user ONLY DURING SIGNUP
    if (this.stores.router.location.pathname.includes(this.INVITE_ROUTE)) {
      this.stores.router.push('/');
    }
  }

  @action async _update({ userData }): Promise<void> {
    if (!this.isLoggedIn) return;

    const response = await this.updateUserInfoRequest.execute(userData).promise;

    this.getUserInfoRequest.patch(() => response.data);
    this.actionStatus = response.status || [];
  }

  @action _resetStatus(): void {
    this.actionStatus = [];
  }

  @action _logout(): void {
    // workaround mobx issue
    localStorage.removeItem('authToken');
    window.localStorage.removeItem('authToken');

    this.getUserInfoRequest.invalidate().reset();
    this.authToken = null;

    this.stores.services.allServicesRequest.invalidate().reset();

    if (this.stores.todos.isTodosEnabled) {
      ipcRenderer.send('clear-storage-data', { sessionId: TODOS_PARTITION_ID });
    }
  }

  @action async _importLegacyServices({ services }): Promise<void> {
    this.isImportLegacyServicesExecuting = true;

    // Reduces recipe duplicates
    const recipes = services
      .filter(
        (obj, pos, arr) =>
          arr.map(mapObj => mapObj.recipe.id).indexOf(obj.recipe.id) === pos,
      )
      .map(s => s.recipe.id);

    // Install recipes
    for (const recipe of recipes) {
      // eslint-disable-next-line no-await-in-loop
      await this.stores.recipes._install({ recipeId: recipe });
    }

    for (const service of services) {
      this.actions.service.createFromLegacyService({
        data: service,
      });
      // eslint-disable-next-line no-await-in-loop
      await this.stores.services.createServiceRequest.promise;
    }

    this.isImportLegacyServicesExecuting = false;
    this.isImportLegacyServicesCompleted = true;
  }

  @action async _delete(): Promise<void> {
    this.deleteAccountRequest.execute();
  }

  // This is a mobx autorun which forces the user to login if not authenticated
  _requireAuthenticatedUser = (): void => {
    if (this.isTokenExpired) {
      this._logout();
    }

    const { router } = this.stores;
    const currentRoute = window.location.hash;
    if (!this.isLoggedIn && currentRoute.includes('token=')) {
      router.push(this.WELCOME_ROUTE);
      const token = currentRoute.split('=')[1];

      const data = this._parseToken(token);
      if (data) {
        // Give this some time to sink
        setTimeout(() => {
          this._tokenLogin(token);
        }, 1000);
      }
    } else if (!this.isLoggedIn && !currentRoute.includes(this.BASE_ROUTE)) {
      router.push(this.WELCOME_ROUTE);
    } else if (this.isLoggedIn && currentRoute === this.LOGOUT_ROUTE) {
      this.actions.user.logout();
      router.push(this.LOGIN_ROUTE);
    } else if (
      this.isLoggedIn &&
      currentRoute.includes(this.BASE_ROUTE) &&
      (this.hasCompletedSignup || this.hasCompletedSignup === null) &&
      !isDevMode
    ) {
      this.stores.router.push('/');
    }
  };

  // Reactions
  async _getUserData(): Promise<void> {
    if (this.isLoggedIn) {
      let data;
      try {
        data = await this.getUserInfoRequest.execute().promise;
      } catch {
        return;
      }

      // We need to set the beta flag for the SettingsStore
      this.actions.settings.update({
        type: 'app',
        data: {
          beta: data.beta,
          locale: data.locale,
        },
      });
    }
  }

  // Helpers
  _shouldRequestNewToken(authToken): boolean {
    try {
      const decoded = jwt.decode(authToken);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      if (decoded.uid) {
        return true;
      }

      return false;
    } catch {
      return true;
    }
  }

  _requestNewToken(): void {
    // Logic to request new token (use an endpoint for that)
    const data = this.requestNewTokenRequest.execute().result;
    if (data) {
      this.authToken = data.token;
      localStorage.setItem('authToken', data.token);
    }
  }

  _parseToken(authToken) {
    try {
      const decoded = jwt.decode(authToken);

      return {
        id: decoded.userId,
        tokenExpiry: moment.unix(decoded.exp).toISOString(),
        authToken,
      };
    } catch {
      this._logout();
      return false;
    }
  }

  _setUserData(authToken: any): void {
    const data = this._parseToken(authToken);
    if (data !== false && data.authToken) {
      localStorage.setItem('authToken', data.authToken);

      this.authToken = data.authToken;
      this.id = data.id;
    } else {
      this.authToken = null;
      this.id = null;
    }
  }

  getAuthURL(url: string): string {
    const parsedUrl = new URL(url);
    const params = new URLSearchParams(parsedUrl.search.slice(1));

    // TODO: Remove the necessity for `as string`
    params.append('authToken', this.authToken!);

    return `${parsedUrl.origin}${parsedUrl.pathname}?${params.toString()}`;
  }

  async _migrateUserLocale(): Promise<void> {
    try {
      await this.getUserInfoRequest.promise;
    } catch {
      return;
    }

    if (!this.data.locale) {
      debug('Migrate "locale" to user data');
      this.actions.user.update({
        userData: {
          locale: this.stores.app.locale,
        },
      });
    }
  }
}
