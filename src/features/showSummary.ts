// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CardFactory, TurnContext, MessageFactory } from 'botbuilder';

import { Handler } from '../handler';

import * as Debug from 'debug'

const debug = Debug('bot:features:beginStandup');

const { ActivityFactory, TemplateEngine } = require('botbuilder-lg');
const path = require('path');

let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));

export default (handler: Handler) => {

  handler.onMessage(async(context, next) => {
    if (context.activity.text) {
      debug('evaluating text for a command', context.activity.text);
      if (context.activity.text.match(/^(summary)/i)) {
        return await handler.triggerEvent(context, 'showSummaryCard', next);
      }
    }
    await next();
  });

  handler.handleEvent('showSummaryCard', async(context, next) => {
    let question_1 = {
      text: "What did you do yesterday?",
      participants: [
        {
          name: "Ben Brown",
          response: "Hi"
        },
        {
          name: "Pooja Nagpal",
          response: "Hey"
        },
        {
          name: "Ryan Lengel Isgrig",
          response: "Ok"
        }
      ]
    };
    let question_2 = {
      text: "What are you doing today?",
      participants: [
        {
          name: "Ben Brown",
          response: "Hi"
        },
        {
          name: "Pooja Nagpal",
          response: "Hey"
        },
        {
          name: "Ryan Lengel Isgrig",
          response: "Ok"
        }
      ]
    };
    let question_3 = {
      text: "Is anything blocking your progress?",
      participants: [
        {
          name: "Ben Brown",
          response: "Hi"
        },
        {
          name: "Pooja Nagpal",
          response: "Hey"
        },
        {
          name: "Ryan Lengel Isgrig",
          response: "Ok"
        }
      ]
    };
    let summary = {
      meeting: "stand-up",
      channel: "stand-up bot",
      questions: [
        question_1,
        question_2,
        question_3
      ]
    };
    await context.sendActivity(ActivityFactory.createActivity(lgEngine.evaluateTemplate("SummaryCard", summary)));
    await next();
  });
}