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

    // Build update object — include order and iconPath if provided
    const updateData = {
      name: data.name,
      services: JSON.stringify(data.services),
    };

    if (data.order !== undefined) {
      updateData.order = data.order;
    }

    // iconPath is stored in the extra data column as JSON
    // We read existing data first so we don't wipe other fields
    const existingQuery = await Workspace.query()
      .where('workspaceId', id)
      .fetch();
    const existing = existingQuery.rows[0];
    let extraData = {};
    if (existing && existing.data) {
      try {
        extraData = JSON.parse(existing.data);
      } catch {
        extraData = {};
      }
    }

    if (data.iconPath !== undefined) {
      extraData.iconPath = data.iconPath;
    }
    updateData.data = JSON.stringify(extraData);

    // Update data in database
    await Workspace.query()
      .where('workspaceId', id)
      .update(updateData);

    // Get updated row
    const workspaceQuery = await Workspace.query()
      .where('workspaceId', id)
      .fetch();
    const workspace = workspaceQuery.rows[0];

    let iconPath = null;
    try {
      const parsedData = JSON.parse(workspace.data || '{}');
      iconPath = parsedData.iconPath || null;
    } catch {
      iconPath = null;
    }

    return response.send({
      id: workspace.workspaceId,
      name: data.name,
      order: workspace.order,
      services: data.services,
      iconPath,
      userId: 1,
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

  // Reorder a single workspace
  async reorder({ request, response, params }) {
    const { id } = params;
    const data = request.all();

    if (data.order === undefined) {
      return response.status(400).send({
        message: 'order is required',
        status: 400,
      });
    }

    await Workspace.query()
      .where('workspaceId', id)
      .update({ order: data.order });

    return response.send({ id, order: data.order });
  }

  // List all workspaces a user has created
  async list({ response }) {
    const allWorkspaces = await Workspace.all();
    const workspaces = allWorkspaces.rows;
    // Convert to array with all data Franz wants
    let workspacesArray = [];
    if (workspaces) {
      workspacesArray = workspaces.map(workspace => {
        let iconPath = null;
        try {
          const extraData = JSON.parse(workspace.data || '{}');
          iconPath = extraData.iconPath || null;
        } catch {
          iconPath = null;
        }

        return {
          id: workspace.workspaceId,
          name: workspace.name,
          order: workspace.order,
          services: convertToJSON(workspace.services),
          iconPath,
          userId: 1,
        };
      });

      // Sort by order ascending
      workspacesArray.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    return response.send(workspacesArray);
  }
}

module.exports = WorkspaceController;
