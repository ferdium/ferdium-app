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

    const toUpdate = request.all();
    const { id } = params;
    const { name, services, iconUrl } = toUpdate;

    // Update data in database
    await Workspace.query()
      .where('workspaceId', id)
      .update({
        name,
        services: JSON.stringify(services),
        data: JSON.stringify({ iconUrl }),
      });

    // Get updated row
    const workspaceQuery = await Workspace.query()
      .where('workspaceId', id)
      .fetch();
    const workspace = workspaceQuery.rows[0];
    let data = {};
    try {
      data = JSON.parse(workspace.data);
    } catch (error) {
      console.warn(
        `[WorkspaceController] edit ${workspace.workspaceId}. Error parsing data JSON`,
        error,
      );
    }
    return response.send({
      id: workspace.workspaceId,
      name: data.name,
      order: workspace.order,
      services: data.services,
      userId: 1,
      iconUrl: data?.iconUrl || '',
    });
  }

  async delete({ response, params }) {
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
      workspacesArray = workspaces.map(workspace => {
        let data = {};
        try {
          data = JSON.parse(workspace.data);
        } catch (error) {
          console.warn(
            `[WorkspaceController] list ${workspace.workspaceId}. Error parsing data JSON`,
            error,
          );
        }
        return {
          id: workspace.workspaceId,
          name: workspace.name,
          iconUrl: data?.iconUrl || '',
          order: workspace.order,
          services: convertToJSON(workspace.services),
          userId: 1,
        };
      });
    }

    return response.send(workspacesArray);
  }
}

module.exports = WorkspaceController;
