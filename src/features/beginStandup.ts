// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CardFactory, TurnContext, MessageFactory } from 'botbuilder';

import { Handler } from '../handler';

import * as Debug from 'debug'

const debug = Debug('bot:features:beginStandup');

const prep_json = {
  "type": "AdaptiveCard",
  "version": "1.0",
  "body": [
      {
          "type": "TextBlock",
          "text": "Preparing a new stand-up meeting..."
      },
  ],
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
};

const card_json = {
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


export default (handler: Handler) => {

  handler.onMessage(async(context, next) => {
    if (context.activity.text) {
      debug('evaluating text for a command', context.activity.text);
      if (context.activity.text.match(/^(start|begin)/i)) {
        if (context.activity.conversation.conversationType === 'channel') {
          // todo: test to see if this is part of an ongoing 
          return await handler.triggerEvent(context, 'beginStandup', next);
        } else {
          return await handler.triggerEvent(context,'beginStandupUsage', next);
        }
      }
    }
    await next();
  });

  handler.handleEvent('beginStandupUsage', async(context, next) => {
    await context.sendActivity('To begin a stand-up, say @standup begin inside a Team chat. I cannot start a new stand-up from inside a 1:1 chat.');
    await next();
  });

  handler.handleEvent('beginStandup', async(context, next) => {

    const reference = TurnContext.getConversationReference(context.activity);
    debug('got conversation reference', reference);

    let card1 = MessageFactory.attachment(CardFactory.adaptiveCard(prep_json));

    // send initial message, and capture the id so we can update it later.
    const results = await context.sendActivity(card1);

    // TODO: when we've got a template based card, we'll actually pass the activityId through so it can be used on the other end
    // to update the card as people reply, etc.
    let card2 = MessageFactory.attachment(CardFactory.adaptiveCard(card_json));
    card2.id = results.id;

    // replace message with a card
    await context.updateActivity(card2);

    // this should let us update the message...
    debug('RESULTS OF SEND', results);

    await next();

  });

}