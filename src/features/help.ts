// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CardFactory, TurnContext, MessageFactory } from 'botbuilder';

import { Handler } from '../handler';

import * as Debug from 'debug'

const debug = Debug('bot:features:showSchedule');

const { ActivityFactory, TemplateEngine } = require('botbuilder-lg');
const path = require('path');

let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));

export default (handler: Handler) => {

  handler.onMessage(async(context, next) => {
    if (context.activity.text) {
      debug('evaluating text for a command', context.activity.text);
      if (context.activity.text.match(/^(help)/i)) {
        return await handler.triggerEvent(context, 'showHelp', next);
      }
    }
    await next();
  });

  handler.handleEvent('showHelp', async(context, next) => {
    await context.sendActivity(ActivityFactory.createActivity(lgEngine.evaluateTemplate("HelpCard")));
    await next();
  });
}