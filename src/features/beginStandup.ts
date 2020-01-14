// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  Handler,
} from '../handler';

import * as Debug from 'debug'

const debug = Debug('bot:features:beginStandup');

export default (handler: Handler) => {

  handler.onMessage(async(context, next) => {
    debug('evaluating text for a command', context.activity.text);
    if (context.activity.text.match(/^(start|begin)/i)) {
      if (context.activity.conversation.conversationType === 'channel') {
        // todo: test to see if this is part of an ongoing 
        return await handler.triggerEvent(context, 'beginStandup', next);
      } else {
        return await handler.triggerEvent(context,'beginStandupUsage', next);
      }
    }
    await next();
  });

  handler.handleEvent('beginStandupUsage', async(context, next) => {
    await context.sendActivity('To begin a stand-up, say @standup begin inside a Team chat. I cannot start a new stand-up from inside a 1:1 chat.');
    await next();
  });

}