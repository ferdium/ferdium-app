const Service = use('App/Models/Service');
const { validateAll } = use('Validator');

const { v4: uuid } = require('uuid');
const {
  DEFAULT_SERVICE_ORDER,
  DEFAULT_SERVICE_SETTINGS,
} = require('../../../../config');
const { convertToJSON } = require('../../../../jsUtils');
const { deduceIconUrl, moveIcon } = require('../../ImageHelper');

class ServiceController {
  // Create a new service for user
  async create({ request, response }) {
    const data = request.all();

    // Validate user input
    const validation = await validateAll(data, {
      name: 'required|string',
      recipeId: 'required',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: validation.messages(),
        status: 401,
      });
    }

    // Get new, unused uuid
    let serviceId;
    do {
      serviceId = uuid();
    } while (
      // eslint-disable-next-line no-await-in-loop, unicorn/no-await-expression-member
      (await Service.query().where('serviceId', serviceId).fetch()).rows
        .length > 0
    );

    await Service.create({
      serviceId,
      name: data.name,
      recipeId: data.recipeId,
      settings: JSON.stringify(data),
    });

    // TODO: Remove duplication
    return response.send({
      data: {
        userId: 1,
        id: serviceId,
        isEnabled: DEFAULT_SERVICE_SETTINGS.isEnabled,
        isNotificationEnabled: DEFAULT_SERVICE_SETTINGS.isNotificationEnabled,
        isBadgeEnabled: DEFAULT_SERVICE_SETTINGS.isBadgeEnabled,
        trapLinkClicks: DEFAULT_SERVICE_SETTINGS.trapLinkClicks,
        useFavicon: DEFAULT_SERVICE_SETTINGS.useFavicon,
        isMuted: DEFAULT_SERVICE_SETTINGS.isMuted,
        isDarkModeEnabled: '', // TODO: This should ideally be a boolean (false). But, changing it caused the sidebar toggle to not work.
        isProgressbarEnabled: DEFAULT_SERVICE_SETTINGS.isProgressbarEnabled,
        spellcheckerLanguage: '',
        order: DEFAULT_SERVICE_ORDER,
        customRecipe: false,
        hasCustomIcon: DEFAULT_SERVICE_SETTINGS.customIcon,
        workspaces: [],
        iconUrl: null,
        // Overwrite previous default settings with what's obtained from the request
        ...data,
      },
      status: ['created'],
    });
  }

  // List all services a user has created
  async list({ response }) {
    const allServices = await Service.all();
    const services = allServices.rows;
    // Convert to array with all data Franz wants
    const servicesArray = services.map(service => {
      const settings = convertToJSON(service.settings);

      // TODO: Remove duplication
      return {
        customRecipe: false,
        hasCustomIcon: DEFAULT_SERVICE_SETTINGS.hasCustomIcon,
        isBadgeEnabled: DEFAULT_SERVICE_SETTINGS.isBadgeEnabled,
        trapLinkClicks: DEFAULT_SERVICE_SETTINGS.trapLinkClicks,
        useFavicon: DEFAULT_SERVICE_SETTINGS.useFavicon,
        isDarkModeEnabled: '', // TODO: This should ideally be a boolean (false). But, changing it caused the sidebar toggle to not work.
        isProgressbarEnabled: DEFAULT_SERVICE_SETTINGS.isProgressbarEnabled,
        isEnabled: DEFAULT_SERVICE_SETTINGS.isEnabled,
        isMuted: DEFAULT_SERVICE_SETTINGS.isMuted,
        isNotificationEnabled: DEFAULT_SERVICE_SETTINGS.isNotificationEnabled,
        order: DEFAULT_SERVICE_ORDER,
        spellcheckerLanguage: '',
        workspaces: [],
        // Overwrite previous default settings with what's obtained from the db
        ...settings,
        // Overwrite even after the spread operator with specific values
        iconUrl: deduceIconUrl(settings.iconId),
        id: service.serviceId,
        name: service.name,
        recipeId: service.recipeId,
        userId: 1,
      };
    });

    return response.send(servicesArray);
  }

  async edit({ request, response, params }) {
    // Upload custom service icon if present
    if (request.file('icon')) {
      const { id } = params;
      const serviceQuery = await Service.query().where('serviceId', id).fetch();
      const service = serviceQuery.rows[0];
      const settings = convertToJSON(service.settings);

      const icon = request.file('icon', {
        types: ['image'],
        size: '2mb',
      });

      const iconId = await moveIcon(icon);
      if (iconId === '-1') {
        return response.status(500).send(icon.error());
      }

      const newSettings = {
        ...settings,
        iconId,
        customIconVersion: settings?.customIconVersion
          ? settings.customIconVersion + 1
          : 1,
      };

      // Update data in database
      await Service.query()
        .where('serviceId', id)
        .update({
          name: service.name,
          settings: JSON.stringify(newSettings),
        });

      return response.send({
        data: {
          id,
          name: service.name,
          ...newSettings,
          iconUrl: deduceIconUrl(newSettings.iconId),
          userId: 1,
        },
        status: ['updated'],
      });
    }

    // Update service info
    const data = request.all();
    const { id } = params;

    // Get current settings from db
    const serviceQuery = await Service.query().where('serviceId', id).fetch();
    const serviceData = serviceQuery.rows[0];

    if (data.customIcon === 'delete') {
      data.iconId = '';
    }

    const settings = {
      ...convertToJSON(serviceData.settings),
      ...data,
    };

    // Update data in database
    await Service.query()
      .where('serviceId', id)
      .update({
        name: data.name,
        settings: JSON.stringify(settings),
      });

    // Get updated row
    const anotherServiceQuery = await Service.query()
      .where('serviceId', id)
      .fetch();
    const service = anotherServiceQuery.rows[0];

    return response.send({
      data: {
        id,
        name: service.name,
        ...settings,
        iconUrl: deduceIconUrl(settings.iconId),
        userId: 1,
      },
      status: ['updated'],
    });
  }

  async reorder({ request, response }) {
    const data = request.all();

    for (const service of Object.keys(data)) {
      // Get current settings from db
      // eslint-disable-next-line no-await-in-loop
      const serviceQuery = await Service.query()
        .where('serviceId', service)
        .fetch();

      const serviceData = serviceQuery.rows[0];

      const settings = {
        ...convertToJSON(serviceData.settings),
        order: data[service],
      };

      // Update data in database
      await Service.query() // eslint-disable-line no-await-in-loop
        .where('serviceId', service)
        .update({
          settings: JSON.stringify(settings),
        });
    }

    // Get new services
    const allServices = await Service.all();
    const services = allServices.rows;
    // Convert to array with all data Franz wants
    const servicesArray = services.map(service => {
      const settings = convertToJSON(service.settings);

      // TODO: Remove duplication
      return {
        customRecipe: false,
        hasCustomIcon: DEFAULT_SERVICE_SETTINGS.customIcon,
        isBadgeEnabled: DEFAULT_SERVICE_SETTINGS.isBadgeEnabled,
        trapLinkClicks: DEFAULT_SERVICE_SETTINGS.trapLinkClicks,
        useFavicon: DEFAULT_SERVICE_SETTINGS.useFavicon,
        isDarkModeEnabled: '', // TODO: This should ideally be a boolean (false). But, changing it caused the sidebar toggle to not work.
        isProgressbarEnabled: DEFAULT_SERVICE_SETTINGS.isProgressbarEnabled,
        isEnabled: DEFAULT_SERVICE_SETTINGS.isEnabled,
        isMuted: DEFAULT_SERVICE_SETTINGS.isMuted,
        isNotificationEnabled: DEFAULT_SERVICE_SETTINGS.isNotificationEnabled,
        order: DEFAULT_SERVICE_ORDER,
        spellcheckerLanguage: '',
        workspaces: [],
        // Overwrite previous default settings with what's obtained from the db
        ...settings,
        // Overwrite even after the spread operator with specific values
        iconUrl: deduceIconUrl(settings.iconId),
        id: service.serviceId,
        name: service.name,
        recipeId: service.recipeId,
        userId: 1,
      };
    });

    return response.send(servicesArray);
  }

  async delete({ params, response }) {
    // Update data in database
    await Service.query().where('serviceId', params.id).delete();

    return response.send({
      message: 'Sucessfully deleted service',
      status: 200,
    });
  }
}

module.exports = ServiceController;
