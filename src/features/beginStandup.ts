// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CardFactory, TurnContext, MessageFactory } from 'botbuilder';

import { Handler } from '../handler';

import * as Debug from 'debug'

const debug = Debug('bot:features:beginStandup');

const {     ActivityFactory, TemplateEngine } = require('botbuilder-lg');
const path = require('path');

let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));

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
    await context.sendActivity(lgEngine.evaluateTemplate("BeginStandupUsage"));
    await next();
  });

  handler.handleEvent('beginStandup', async(context, next) => {

    const reference = TurnContext.getConversationReference(context.activity);
    debug('got conversation reference', reference);

    // send initial message, and capture the id so we can update it later.    
    const results = await context.sendActivity(ActivityFactory.createActivity(lgEngine.evaluateTemplate("PrepareStandUpCard")));

    // TODO: when we've got a template based card, we'll actually pass the activityId through so it can be used on the other end
    // to update the card as people reply, etc.
    let startStandUpCard = ActivityFactory.createActivity(lgEngine.evaluateTemplate("StartStandUpCard"));
    startStandUpCard.id = results.id;

    // replace message with a card
    await context.updateActivity(startStandUpCard);

    // this should let us update the message...
    debug('RESULTS OF SEND', results);

    await next();

  });

}