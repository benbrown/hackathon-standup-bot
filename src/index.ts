// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required pckages
import * as path from 'path';
import * as restify from 'restify';
import { BotFrameworkAdapter, CardFactory } from 'botbuilder';


// const { TeamsConversationBot } = require('./bots/teamsConversationBot');

// Read botFilePath and botFileSecret from .env file.
const ENV_FILE = path.join(__dirname, '..','.env');
require('dotenv').config({ path: ENV_FILE });

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Create the bot that will handle incoming messages.
// const bot = new TeamsConversationBot();

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
});

let card_json = {
  "type": "AdaptiveCard",
  "version": "1.0",
  "body": [
      {
          "type": "TextBlock",
          "text": "It's time for a stand-up! Click the button below to start yours."
      },
      {
          "type": "ActionSet",
          "actions": [
              {
                  "type": "Action.Submit",
                  "title": "Begin My Stand-up",
                  "style": "positive",
                  "id": "begin",
                  "data": {
                    "command": "begin"
                  },
              }
          ]
      }
  ],
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
};

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {


      console.log(JSON.stringify(context.activity, null, 2));

      if (context.activity.value && context.activity.value.command == 'begin') {
        await context.sendActivity('ok i will dm you');
      } else {
        await context.sendActivity({
          text: 'Hello',
          attachments: [
            CardFactory.adaptiveCard(card_json)
          ]
        });
      }
    });
});