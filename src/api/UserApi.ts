import { BinaryLike } from 'crypto';
import { hash } from '../helpers/password-helpers';

export default class UserApi {
  server: any;

  local: any;

  constructor(server: any, local: any) {
    this.server = server;
    this.local = local;
  }

  login(email: string, password: BinaryLike) {
    return this.server.login(email, hash(password));
  }

  logout() {
    return this;
  }

  signup(data: { password: BinaryLike }) {
    Object.assign(data, {
      password: hash(data.password),
    });
    return this.server.signup(data);
  }

  password(email: string) {
    return this.server.retrievePassword(email);
  }

  invite(data: any) {
    return this.server.inviteUser(data);
  }

  getInfo() {
    return this.server.userInfo();
  }

  updateInfo(data: { oldPassword: string; newPassword: string }) {
    const userData = data;
    if (userData.oldPassword && userData.newPassword) {
      userData.oldPassword = hash(userData.oldPassword);
      userData.newPassword = hash(userData.newPassword);
    }

    return this.server.updateUserInfo(userData);
  }

  getLegacyServices() {
    return this.server.getLegacyServices();
  }

  delete() {
    return this.server.deleteAccount();
  }
}
