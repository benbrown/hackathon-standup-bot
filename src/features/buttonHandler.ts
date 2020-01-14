// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

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
    
      await context.sendActivity('I got your click.');
      await next();
  });



}