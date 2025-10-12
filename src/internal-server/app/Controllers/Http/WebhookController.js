'use strict';

const axios = require('axios');

class WebhookController {
  async sendMessage(recipientId, messageText) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: messageText,
      },
    };

    try {
      await axios.post(
        `https://graph.facebook.com/v13.0/me/messages?access_token=${process.env.MESSENGER_PAGE_ACCESS_TOKEN}`,
        messageData,
      );
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Unable to send message:', error);
    }
  }

  async handleWebhook({ request, response }) {
    if (request.method() === 'GET') {
      // Facebook Messenger webhook verification
      const mode = request.input('hub.mode');
      const token = request.input('hub.verify_token');
      const challenge = request.input('hub.challenge');

      // Check if a token and mode is in the query string of the request
      if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === process.env.MESSENGER_VERIFY_TOKEN) {
          // Respond with the challenge token from the request
          console.log('WEBHOOK_VERIFIED');
          response.status(200).send(challenge);
        } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          response.sendStatus(403);
        }
      } else {
        response.send('GET request received at webhook endpoint');
      }
    } else if (request.method() === 'POST') {
      const body = request.post();

      // Checks this is an event from a page subscription
      if (body.object === 'page') {
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(entry => {
          // Gets the message. entry.messaging is an array, but
          // will only ever contain one message, so we get index 0
          const webhookEvent = entry.messaging[0];
          console.log(webhookEvent);

          const senderId = webhookEvent.sender.id;
          const messageText = webhookEvent.message.text;

          if (messageText) {
            this.sendMessage(senderId, `You sent the message: "${messageText}".`);
          }
        });

        // Returns a '200 OK' response to all requests
        response.status(200).send('EVENT_RECEIVED');
      } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        response.sendStatus(404);
      }
    } else {
      response.send('Webhook endpoint is live');
    }
  }
}

module.exports = WebhookController;
