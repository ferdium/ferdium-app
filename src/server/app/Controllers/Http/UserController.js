const Service = use('App/Models/Service');
const Workspace = use('App/Models/Workspace');
const {
  validateAll,
} = use('Validator');
const Env = use('Env');

const btoa = require('btoa');
const fetch = require('node-fetch');
const uuid = require('uuid/v4');
const crypto = require('crypto');

const apiRequest = (url, route, method, auth) => new Promise((resolve, reject) => {
  const base = url + '/v1/';
  const user = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Ferdi/5.3.0-beta.1 Chrome/69.0.3497.128 Electron/4.2.4 Safari/537.36';

  try {
    fetch(base + route, {
      method,
      headers: {
        Authorization: `Bearer ${auth}`,
        'User-Agent': user,
      },
    })
      .then(data => data.json())
      .then(json => resolve(json));
  } catch (e) {
    reject();
  }
});

class UserController {
  // Register a new user
  async signup({
    request,
    response,
  }) {
    // Validate user input
    const validation = await validateAll(request.all(), {
      firstname: 'required',
      email: 'required|email',
      password: 'required',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: validation.messages(),
        status: 401,
      });
    }

    return response.send({
      message: 'Successfully created account',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJGZXJkaSBJbnRlcm5hbCBTZXJ2ZXIiLCJpYXQiOjE1NzEwNDAyMTUsImV4cCI6MjUzMzk1NDE3ODQ0LCJhdWQiOiJnZXRmZXJkaS5jb20iLCJzdWIiOiJmZXJkaUBsb2NhbGhvc3QiLCJ1c2VySWQiOiIxIn0.9_TWFGp6HROv8Yg82Rt6i1-95jqWym40a-HmgrdMC6M',
    });
  }

  // Login using an existing user
  async login({
    request,
    response,
  }) {
    if (!request.header('Authorization')) {
      return response.status(401).send({
        message: 'Please provide authorization',
        status: 401,
      });
    }

    return response.send({
      message: 'Successfully logged in',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJGZXJkaSBJbnRlcm5hbCBTZXJ2ZXIiLCJpYXQiOjE1NzEwNDAyMTUsImV4cCI6MjUzMzk1NDE3ODQ0LCJhdWQiOiJnZXRmZXJkaS5jb20iLCJzdWIiOiJmZXJkaUBsb2NhbGhvc3QiLCJ1c2VySWQiOiIxIn0.9_TWFGp6HROv8Yg82Rt6i1-95jqWym40a-HmgrdMC6M',
    });
  }

  // Return information about the current user
  async me({
    response,
  }) {
    return response.send({
      accountType: 'individual',
      beta: false,
      donor: {},
      email: '',
      emailValidated: true,
      features: {},
      firstname: 'Ferdi',
      id: '82c1cf9d-ab58-4da2-b55e-aaa41d2142d8',
      isPremium: true,
      isSubscriptionOwner: true,
      lastname: 'Application',
      locale: 'en-US',
    });
  }


  async import({
    request,
    response,
  }) {
    // Validate user input
    const validation = await validateAll(request.all(), {
      email: 'required|email',
      password: 'required',
      server: 'required',
    });
    if (validation.fails()) {
      let errorMessage = 'There was an error while trying to import your account:\n';
      for (const message of validation.messages()) {
        if (message.validation === 'required') {
          errorMessage += `- Please make sure to supply your ${message.field}\n`;
        } else if (message.validation === 'unique') {
          errorMessage += '- There is already a user with this email.\n';
        } else {
          errorMessage += `${message.message}\n`;
        }
      }
      return response.status(401).send(errorMessage);
    }

    const {
      email,
      password,
      server,
    } = request.all();

    const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');

    const base = server + '/v1/';
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Ferdi/5.3.0-beta.1 Chrome/69.0.3497.128 Electron/4.2.4 Safari/537.36';

    // Try to get an authentication token
    let token;
    try {
      const basicToken = btoa(`${email}:${hashedPassword}`);

      const rawResponse = await fetch(`${base}auth/login`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicToken}`,
          'User-Agent': userAgent,
        },
      });
      const content = await rawResponse.json();

      if (!content.message || content.message !== 'Successfully logged in') {
        const errorMessage = 'Could not login into Franz with your supplied credentials. Please check and try again';
        return response.status(401).send(errorMessage);
      }

      // eslint-disable-next-line prefer-destructuring
      token = content.token;
    } catch (e) {
      return response.status(401).send({
        message: 'Cannot login to Franz',
        error: e,
      });
    }

    // Get user information
    let userInf = false;
    try {
      userInf = await apiRequest(server, 'me', 'GET', token);
    } catch (e) {
      const errorMessage = `Could not get your user info from Franz. Please check your credentials or try again later.\nError: ${e}`;
      return response.status(401).send(errorMessage);
    }
    if (!userInf) {
      const errorMessage = 'Could not get your user info from Franz. Please check your credentials or try again later';
      return response.status(401).send(errorMessage);
    }

    const serviceIdTranslation = {};

    // Import services
    try {
      const services = await apiRequest(server, 'me/services', 'GET', token);

      for (const service of services) {
        // Get new, unused uuid
        let serviceId;
        do {
          serviceId = uuid();
        } while ((await Service.query().where('serviceId', serviceId).fetch()).rows.length > 0); // eslint-disable-line no-await-in-loop

        await Service.create({ // eslint-disable-line no-await-in-loop
          serviceId,
          name: service.name,
          recipeId: service.recipeId,
          settings: JSON.stringify(service),
        });

        serviceIdTranslation[service.id] = serviceId;
      }
    } catch (e) {
      const errorMessage = `Could not import your services into our system.\nError: ${e}`;
      return response.status(401).send(errorMessage);
    }

    // Import workspaces
    try {
      const workspaces = await apiRequest(server, 'workspace', 'GET', token);

      for (const workspace of workspaces) {
        let workspaceId;
        do {
          workspaceId = uuid();
        } while ((await Workspace.query().where('workspaceId', workspaceId).fetch()).rows.length > 0); // eslint-disable-line no-await-in-loop

        const services = workspace.services.map(service => serviceIdTranslation[service]);

        await Workspace.create({ // eslint-disable-line no-await-in-loop
          workspaceId,
          name: workspace.name,
          order: workspace.order,
          services: JSON.stringify(services),
          data: JSON.stringify({}),
        });
      }
    } catch (e) {
      const errorMessage = `Could not import your workspaces into our system.\nError: ${e}`;
      return response.status(401).send(errorMessage);
    }

    return response.send('Your account has been imported. You can now use your Franz account in Ferdi.');
  }
}

module.exports = UserController;
