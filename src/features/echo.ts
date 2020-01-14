// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  TeamsActivityHandler,
} from 'botbuilder';

import * as Debug from 'debug'

const debug = Debug('bot:features:echo');

debug('loading echo feature');

export default (handler: TeamsActivityHandler) => {

  handler.onMessage(async(context, next) => {
      debug('echoing incoming message', context.activity.text);
      await context.sendActivity('Echo: ' + context.activity.text);
      await next();
  });

}