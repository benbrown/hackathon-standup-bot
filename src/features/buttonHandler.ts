// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { TeamsInfo, TurnContext, BotFrameworkAdapter } from 'botbuilder';

import {
  Handler,
} from '../handler';

import * as Debug from 'debug'

const debug = Debug('bot:features:beginStandup');

debug('loading echo feature');

export default (handler: Handler) => {

  handler.onMessage(async(context, next) => {
    if (context.activity.value && context.activity.value.command == 'begin') {
      return await handler.triggerEvent(context, 'standupButtonClicked',  next);
    }
    await next();
  });

  handler.handleEvent('standupButtonClicked', async(context, next) => {
    let ref = TurnContext.getConversationReference(context.activity);

    // get more specific about what type of adapter this is cause the botadapter base class doesn't have createConversation and ts is complaining
    const adapter: BotFrameworkAdapter = context.adapter as BotFrameworkAdapter;

    // create a 1:1 context...
    await adapter.createConversation(ref, async(private_context) => {
      await private_context.sendActivity('t1 your click.');
      await next();
    });

  });



}