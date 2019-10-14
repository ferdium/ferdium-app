class DashboardController {
  async data({
    auth,
    view,
  }) {
    const general = auth.user;
    const services = (await auth.user.services().fetch()).toJSON();
    const workspaces = (await auth.user.workspaces().fetch()).toJSON();

    return view.render('dashboard.data', {
      username: general.username,
      mail: general.email,
      created: general.created_at,
      updated: general.updated_at,
      services,
      workspaces,
    });
  }

  logout({
    auth,
    response,
  }) {
    auth.authenticator('session').logout();
    return response.redirect('/user/login');
  }

  delete({
    auth,
    response,
  }) {
    auth.user.delete();
    auth.authenticator('session').logout();
    return response.redirect('/user/login');
  }
}

module.exports = DashboardController;
