// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {  MessageFactory, CardFactory, TurnContext, TeamsInfo } from 'botbuilder';

import { Handler } from '../handler';

import * as Debug from 'debug'

const debug = Debug('bot:features:scheduler');

const { TemplateEngine } = require('botbuilder-lg');
const path = require('path');

let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));

export default (handler: Handler) => {

  handler.onMessage(async(context, next) => {
    if (context.activity.text) {
      debug('evaluating text for start command:', context.activity.text);
      if (context.activity.text.match(/^(schedule)/i)) {
        if (context.activity.conversation.conversationType === 'channel') {
          // todo: test to see if this is part of an ongoing 
          return await handler.triggerEvent(context, 'showSchedule', next);
        } else {
          return await handler.triggerEvent(context,'scheduleUsage', next);
        }
      }
    }
    await next();
  });

  handler.handleEvent('scheduleUsage', async(context, next) => {
    // await context.sendActivity(lgEngine.evaluateTemplate("BeginStandupUsage"));
    await next();
  });

  handler.handleEvent('showSchedule', async(context, next) => {

    // first, we need to get the channel id.
    const reference = TurnContext.getConversationReference(context.activity);

    const teamDetails = await TeamsInfo.getTeamDetails(context);
    const channelList = await TeamsInfo.getTeamChannels(context);
    const thisChannel = channelList.filter((channel) => { return reference.conversation.id.indexOf(channel.id) === 0 });
    const channelId = thisChannel[0].id;
    
    const card = CardFactory.heroCard('Stand-up Schedule',
    'Current schedule is...',
    null, // No images
    [{ type: 'invoke', title: 'Change Schedule', value: { type: 'task/fetch', data: 'adaptivecard' } }]);
    const message = MessageFactory.attachment(card);
    await context.sendActivity(message);

    await next();

  });

  handler.onInvoke

}