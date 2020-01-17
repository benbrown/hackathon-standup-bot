// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { MessageFactory, CardFactory, TurnContext, TeamsInfo } from 'botbuilder';
import { AppCredentials } from 'botframework-connector';

import { Handler } from '../handler';

import * as Debug from 'debug'
import * as path  from 'path';
import * as scheduler from 'node-schedule';

const debug = Debug('bot:features:scheduler');

const { TemplateEngine } = require('botbuilder-lg');

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

    const channelList = await TeamsInfo.getTeamChannels(context);
    const thisChannel = channelList.filter((channel) => { return reference.conversation.id.indexOf(channel.id) === 0 });
    const channelId = thisChannel[0].id;
    
    const schedule = await handler.db.getScheduleForChannel(channelId);

    let description = '';

    if (schedule) {
      let daysofweek = []
      if (schedule.Monday == 'true' && schedule.Tuesday == 'true' && schedule.Wednesday == 'true' && schedule.Thursday == 'true' && schedule.Friday == 'true') {
        daysofweek.push('every weekday');
      } else if (schedule.Monday == 'true' && schedule.Tuesday == 'true' && schedule.Wednesday == 'true' && schedule.Thursday == 'true' && schedule.Friday == 'true' && schedule.Saturday == 'true' && schedule.Sunday == 'true') {
        daysofweek.push('every day');
      } else {
        if (schedule.Monday == 'true') {
          daysofweek.push('Monday');
        }
        if (schedule.Tuesday == 'true') {
          daysofweek.push('Tuesday');
        }
        if (schedule.Wednesday == 'true') {
          daysofweek.push('Wednesday');
        }
        if (schedule.Thursday == 'true') {
          daysofweek.push('Thursday');
        }
        if (schedule.Friday == 'true') {
          daysofweek.push('Friday');
        }
        if (schedule.Saturday == 'true') {
          daysofweek.push('Saturday');
        }
        if (schedule.Sunday == 'true') {
          daysofweek.push('Sunday');
        }
      }

      description = `Stand-up is currently scheduled for ${ schedule.MeetingTime } on ${ daysofweek.join(' and ') }.`;
    } else {
      description = 'No stand-up is currently scheduled for this channel.';
    }

    const card = CardFactory.heroCard('Stand-up Schedule',
    description,
    null, // No images
    [{ type: 'invoke', title: 'Set Schedule', value: { type: 'task/fetch', data: 'showSchedule' } }]);
    const message = MessageFactory.attachment(card);
    await context.sendActivity(message);

    await next();

  });

  handler.handleEvent('updateSchedule', async(context, next) => {
    const channelList = await TeamsInfo.getTeamChannels(context);
    const thisChannel = channelList.filter((channel) => { return context.activity.conversation.id.indexOf(channel.id) === 0 });
    const channelId = thisChannel[0].id;

    let schedule = {
      ...context.activity.value.data,
      teamId: context.activity.channelData.team.id,
      reference: TurnContext.getConversationReference(context.activity)
    }
    await handler.db.setScheduleForChannel(channelId, schedule);

    // todo update the card used to trigger the task?
    await context.sendActivity('The stand-up schedule was updated by ' + context.activity.from.name);

    buildCron();

    await next();
  });

  const buildCron = async() => {
    const schedule = await handler.db.getSchedule();
    debug('entire schedule:', schedule);

    for (const channelId in schedule) {
      const channel_schedule = schedule[channelId];
      if (channel_schedule.MeetingTime) {
        scheduler.cancelJob(channelId);
        scheduler.scheduleJob(channelId, scheduleToCron(channel_schedule), runSchedule(channelId));
      }
    }
  }

  const scheduleToCron = (schedule) => {
    debug('schedule:', schedule);
    let [hour, minute] = schedule.MeetingTime.split(/\:/);

    let daysofweek = []
    if (schedule.Sunday == 'true') {
      daysofweek.push(0);
    }
    if (schedule.Monday == 'true') {
      daysofweek.push(1);
    }
    if (schedule.Tuesday == 'true') {
      daysofweek.push(2);
    }
    if (schedule.Wednesday == 'true') {
      daysofweek.push(3);
    }
    if (schedule.Thursday == 'true') {
      daysofweek.push(4);
    }
    if (schedule.Friday == 'true') {
      daysofweek.push(5);
    }
    if (schedule.Saturday == 'true') {
      daysofweek.push(6);
    }

    let cron = `0 ${ parseInt(minute) } ${ parseInt(hour) } * * ${ daysofweek.join(',') }`;
    debug('schedule:', schedule);
    debug('cron: ', cron);
    return cron;
  }

  const runSchedule = (channelId: string) => {
    return async() => {
      debug('RUN SCHEDULE FOR CHANNEL', channelId);

      const schedule = await handler.db.getScheduleForChannel(channelId);

      schedule.reference.conversation.id = schedule.reference.conversation.id.replace(/\;messageid\=.*/,'');
      debug('SCHEDULE:', schedule);

      await handler.adapter.continueConversation(schedule.reference,
            async (context) => {

              AppCredentials.trustServiceUrl(schedule.reference.serviceUrl);

              // make sure the activity has the necessary teams-specific fields 
              if (!context.activity.channelData) {
                context.activity.channelData = {};
              }
              context.activity.channelData.team = { 
                id: schedule.teamId,
              }
              return await handler.triggerEvent(context, 'beginStandup', async() => {});
            }
      );

    }
  }

  // load the cron and set it up at boot time
  buildCron();

}