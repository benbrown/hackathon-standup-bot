"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const Debug = require("debug");
const path = require("path");
const scheduler = require("node-schedule");
const debug = Debug('bot:features:scheduler');
const { TemplateEngine } = require('botbuilder-lg');
let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));
exports.default = (handler) => {
    handler.onMessage((context, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (context.activity.text) {
            debug('evaluating text for start command:', context.activity.text);
            if (context.activity.text.match(/^(schedule)/i)) {
                if (context.activity.conversation.conversationType === 'channel') {
                    // todo: test to see if this is part of an ongoing 
                    return yield handler.triggerEvent(context, 'showSchedule', next);
                }
                else {
                    return yield handler.triggerEvent(context, 'scheduleUsage', next);
                }
            }
        }
        yield next();
    }));
    handler.handleEvent('scheduleUsage', (context, next) => __awaiter(void 0, void 0, void 0, function* () {
        // await context.sendActivity(lgEngine.evaluateTemplate("BeginStandupUsage"));
        yield next();
    }));
    handler.handleEvent('showSchedule', (context, next) => __awaiter(void 0, void 0, void 0, function* () {
        // first, we need to get the channel id.
        const reference = botbuilder_1.TurnContext.getConversationReference(context.activity);
        const channelList = yield botbuilder_1.TeamsInfo.getTeamChannels(context);
        const thisChannel = channelList.filter((channel) => { return reference.conversation.id.indexOf(channel.id) === 0; });
        const channelId = thisChannel[0].id;
        const schedule = yield handler.db.getScheduleForChannel(channelId);
        const card = botbuilder_1.CardFactory.heroCard('Stand-up Schedule', 'Current schedule is...', null, // No images
        [{ type: 'invoke', title: 'Set Schedule', value: { type: 'task/fetch', data: 'showSchedule' } }]);
        const message = botbuilder_1.MessageFactory.attachment(card);
        yield context.sendActivity(message);
        yield next();
    }));
    handler.handleEvent('updateSchedule', (context, next) => __awaiter(void 0, void 0, void 0, function* () {
        const channelList = yield botbuilder_1.TeamsInfo.getTeamChannels(context);
        const thisChannel = channelList.filter((channel) => { return context.activity.conversation.id.indexOf(channel.id) === 0; });
        const channelId = thisChannel[0].id;
        let schedule = Object.assign(Object.assign({}, context.activity.value.data), { teamId: context.activity.channelData.team.id, reference: botbuilder_1.TurnContext.getConversationReference(context.activity) });
        yield handler.db.setScheduleForChannel(channelId, schedule);
        // todo update the card used to trigger the task?
        yield context.sendActivity('The stand-up schedule was updated by ' + context.activity.from.name);
        buildCron();
        yield next();
    }));
    const buildCron = () => __awaiter(void 0, void 0, void 0, function* () {
        const schedule = yield handler.db.getSchedule();
        debug('entire schedule:', schedule);
        for (const channelId in schedule) {
            const channel_schedule = schedule[channelId];
            if (channel_schedule.MeetingTime) {
                scheduler.cancelJob(channelId);
                scheduler.scheduleJob(channelId, scheduleToCron(channel_schedule), runSchedule(channelId));
            }
        }
    });
    const scheduleToCron = (schedule) => {
        debug('schedule:', schedule);
        let [hour, minute] = schedule.MeetingTime.split(/\:/);
        let daysofweek = [];
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
        let cron = `0 ${parseInt(minute)} ${parseInt(hour)} * * ${daysofweek.join(',')}`;
        debug('schedule:', schedule);
        debug('cron: ', cron);
        return cron;
    };
    const runSchedule = (channelId) => {
        return () => __awaiter(void 0, void 0, void 0, function* () {
            debug('RUN SCHEDULE FOR CHANNEL', channelId);
            const schedule = yield handler.db.getScheduleForChannel(channelId);
            schedule.reference.conversation.id = schedule.reference.conversation.id.replace(/\;messageid\=.*/, '');
            debug('SCHEDULE:', schedule);
            yield handler.adapter.continueConversation(schedule.reference, (context) => __awaiter(void 0, void 0, void 0, function* () {
                // make sure the activity has the necessary teams-specific fields 
                if (!context.activity.channelData) {
                    context.activity.channelData = {};
                }
                context.activity.channelData.team = {
                    id: schedule.teamId,
                };
                return yield handler.triggerEvent(context, 'beginStandup', () => __awaiter(void 0, void 0, void 0, function* () { }));
            }));
        });
    };
    // load the cron and set it up at boot time
    buildCron();
};
//# sourceMappingURL=scheduler.js.map