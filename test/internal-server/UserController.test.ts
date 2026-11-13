type Row = Record<string, string>;

const mockCreated: { services: Row[]; workspaces: Row[] } = {
  services: [],
  workspaces: [],
};

function mockModel(rows: Row[]) {
  return {
    create: jest.fn(async (data: Row) => {
      rows.push(data);
    }),
    query: () => ({
      where: () => ({
        fetch: async () => ({ rows: [] }),
      }),
    }),
  };
}

const adonisModules: Record<string, unknown> = {
  'App/Models/User': {},
  'App/Models/Service': mockModel(mockCreated.services),
  'App/Models/Workspace': mockModel(mockCreated.workspaces),
  Validator: {
    validateAll: async () => ({ fails: () => false }),
  },
};

Object.assign(globalThis, { use: (name: string) => adonisModules[name] });

jest.mock('../../src/environment-remote', () => ({
  API_VERSION: 'v1',
}));

type ImportResult = Promise<unknown>;

interface UserControllerInstance {
  importFerdium(context: {
    request: { all: () => object; input: () => string };
    response: { send: (body: unknown) => unknown; status: () => unknown };
  }): ImportResult;
}

const UserController = jest.requireActual<new () => UserControllerInstance>(
  '../../src/internal-server/app/Controllers/Http/UserController',
);

function importFile(data: object): ImportResult {
  const file = JSON.stringify(data);
  const response = {
    send: (body: unknown) => body,
    status: () => response,
  };

  return new UserController().importFerdium({
    request: { all: () => ({ file }), input: () => file },
    response,
  });
}

describe('UserController.importFerdium', () => {
  beforeEach(() => {
    mockCreated.services.length = 0;
    mockCreated.workspaces.length = 0;
  });

  it('imports an export from a Ferdium server, which uses snake_case keys', async () => {
    const result = await importFile({
      username: 'Jane',
      services: [
        {
          id: 11,
          service_id: 'server-service-1',
          name: 'Chat',
          recipe_id: 'slack',
          settings: { isMuted: true },
        },
        {
          id: 12,
          service_id: 'server-service-2',
          name: 'Mail',
          recipe_id: 'gmail',
          settings: {},
        },
      ],
      workspaces: [
        {
          id: 5,
          workspace_id: 'server-workspace-1',
          name: 'Work',
          order: 0,
          services: ['server-service-2', 'server-service-1'],
          data: { name: 'Work' },
        },
      ],
    });

    expect(result).toBe('Your account has been imported.');
    expect(mockCreated.services.map(service => service.recipeId)).toEqual([
      'slack',
      'gmail',
    ]);
    const [chat, mail] = mockCreated.services.map(service => service.serviceId);
    expect(JSON.parse(mockCreated.workspaces[0].services)).toEqual([
      mail,
      chat,
    ]);
  });

  it('imports an export from the internal server', async () => {
    const result = await importFile({
      username: 'Ferdium',
      services: [
        {
          id: 1,
          serviceId: 'local-service-1',
          name: 'Chat',
          recipeId: 'slack',
          settings: '{"isMuted":true}',
        },
      ],
      workspaces: [
        {
          id: 1,
          workspaceId: 'local-workspace-1',
          name: 'Work',
          order: 0,
          services: '["local-service-1"]',
          data: '{"name":"Work"}',
        },
      ],
    });

    expect(result).toBe('Your account has been imported.');
    expect(mockCreated.services[0].recipeId).toBe('slack');
    expect(JSON.parse(mockCreated.workspaces[0].services)).toEqual([
      mockCreated.services[0].serviceId,
    ]);
  });
});
