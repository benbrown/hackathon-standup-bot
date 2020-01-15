// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {  TurnContext, TeamsInfo } from 'botbuilder';

import { Handler } from '../handler';

import * as Debug from 'debug'

const debug = Debug('bot:features:beginStandup');

const { ActivityFactory, TemplateEngine } = require('botbuilder-lg');
const path = require('path');

let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));

export default (handler: Handler) => {

  handler.onMessage(async(context, next) => {
    if (context.activity.text) {
      debug('evaluating text for start command:', context.activity.text);
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

    // first, we need to get the channel id.
    const reference = TurnContext.getConversationReference(context.activity);

    const teamDetails = await TeamsInfo.getTeamDetails(context);
    const channelList = await TeamsInfo.getTeamChannels(context);
    const thisChannel = channelList.filter((channel) => { return reference.conversation.id.indexOf(channel.id) === 0 });
    
    const channelId = thisChannel[0].id;

    let currentStandup = await handler.db.getStandupForChannel(channelId);
    // debug('got current standup: ', currentStandup);

    if (currentStandup) {
      // end this standup.
      // perhaps we want to do some final action here, like update the card to REMOVE THE BUTTON
    } else {
      // debug('creating new standup');
      currentStandup = {};
    }

    // send initial message, and capture the id so we can update it later.    
    // const results = await context.sendActivity(ActivityFactory.createActivity(lgEngine.evaluateTemplate("PrepareStandUpCard")));

    let startStandUpCard = ActivityFactory.createActivity(lgEngine.evaluateTemplate("StartStandUpCard"));

    // replace message with a card
    const results = await context.sendActivity(startStandUpCard);

    currentStandup.original_card = results.id;
    currentStandup.channelId = channelId;
    currentStandup.channel = thisChannel[0].name;
    currentStandup.team = teamDetails.name;
    currentStandup.respondees = [];
    currentStandup.questions = [{
      text: 'What did you do yesterday?',
      participants: [],
    },
    {
      text: 'What are you doing today?',
      participants: [],
    },
    {
      text: 'Is anything blocking your progress?',
      participants: [],
    }];

    await handler.db.saveStandup(currentStandup);

    await next();

  });

}