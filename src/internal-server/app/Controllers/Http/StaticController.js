/**
 * Controller for routes with static responses
 */

class StaticController {
  // Enable all features
  features({
    response,
  }) {
    return response.send({
      isServiceProxyEnabled: true,
      isWorkspaceEnabled: true,
      isAnnouncementsEnabled: true,
      isSettingsWSEnabled: false,
      isMagicBarEnabled: true,
      isTodosEnabled: true,
      subscribeURL: 'https://getferdi.com',
      hasInlineCheckout: true,
    });
  }

  // Show announcements
  announcement({
    response,
  }) {
    return response.send({});
  }
}

module.exports = StaticController;
