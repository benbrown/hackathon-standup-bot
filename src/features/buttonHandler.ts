// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { TeamsInfo, TurnContext, BotFrameworkAdapter } from 'botbuilder';
import { WaterfallDialog } from 'botbuilder-dialogs';

import {
  Handler,
} from '../handler';

import { standupDialog } from './dialogs/standup';

import * as Debug from 'debug'

const debug = Debug('bot:features:beginStandup');

debug('loading echo feature');

export default (handler: Handler) => {

  // make the standup dialog available
  handler.addDialog(standupDialog);

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
      // I think we need to create a new dialog context here
      // and begin the dialog
      // and then save the state again...
      const dialogContext = await handler.dialogSet.createContext(private_context);
      await dialogContext.beginDialog('STANDUP', {});
      await handler.saveState(private_context);

      // todo: not sure if we should call this inside the callback or outside...
      await next();

    });

  });



}