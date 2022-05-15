const Workspace = use('App/Models/Workspace');
const { validateAll } = use('Validator');

const { v4: uuid } = require('uuid');
const { convertToJSON } = require('../../../../jsUtils');

class WorkspaceController {
  // Create a new workspace for user
  async create({ request, response }) {
    // Validate user input
    const validation = await validateAll(request.all(), {
      name: 'required',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: validation.messages(),
        status: 401,
      });
    }

    const data = request.all();

    // Get new, unused uuid
    let workspaceId;
    do {
      workspaceId = uuid();
    } while (
      // eslint-disable-next-line no-await-in-loop, unicorn/no-await-expression-member
      (await Workspace.query().where('workspaceId', workspaceId).fetch()).rows
        .length > 0
    );

    const allWorkspaces = await Workspace.all();
    const order = allWorkspaces.rows.length;
    const { name } = data;
    delete data.name;

    await Workspace.create({
      workspaceId,
      name,
      order,
      services: JSON.stringify([]),
      data: JSON.stringify(data),
    });

    return response.send({
      userId: 1,
      name,
      id: workspaceId,
      order,
      workspaces: [],
    });
  }

  async edit({ request, response, params }) {
    // Validate user input
    const validation = await validateAll(request.all(), {
      name: 'required',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: validation.messages(),
        status: 401,
      });
    }

    const data = request.all();
    const { id } = params;

    // Update data in database
    await Workspace.query()
      .where('workspaceId', id)
      .update({
        name: data.name,
        services: JSON.stringify(data.services),
      });

    // Get updated row
    const workspaceQuery = await Workspace.query()
      .where('workspaceId', id)
      .fetch();
    const workspace = workspaceQuery.rows[0];

    return response.send({
      id: workspace.workspaceId,
      name: data.name,
      order: workspace.order,
      services: data.services,
      userId: 1,
    });
  }

  async delete({
    // eslint-disable-next-line no-unused-vars
    request,
    response,
    params,
  }) {
    // Validate user input
    const validation = await validateAll(params, {
      id: 'required',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Invalid arguments',
        messages: validation.messages(),
        status: 401,
      });
    }

    const { id } = params;

    // Update data in database
    await Workspace.query().where('workspaceId', id).delete();

    return response.send({
      message: 'Successfully deleted workspace',
    });
  }

  // List all workspaces a user has created
  async list({ response }) {
    const allWorkspaces = await Workspace.all();
    const workspaces = allWorkspaces.rows;
    // Convert to array with all data Franz wants
    let workspacesArray = [];
    if (workspaces) {
      workspacesArray = workspaces.map(workspace => ({
        id: workspace.workspaceId,
        name: workspace.name,
        order: workspace.order,
        services: convertToJSON(workspace.services),
        userId: 1,
      }));
    }

    return response.send(workspacesArray);
  }
}

module.exports = WorkspaceController;
