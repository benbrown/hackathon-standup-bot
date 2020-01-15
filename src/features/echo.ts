// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  TeamsActivityHandler,
} from 'botbuilder';

import * as Debug from 'debug'

const debug = Debug('bot:features:echo');

export default (handler: TeamsActivityHandler) => {

  handler.onMessage(async(context, next) => {
      debug('INCOMING >', JSON.stringify(context.activity, null, 2));
      await next();
  });

}