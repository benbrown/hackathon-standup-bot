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
const debug = Debug('bot:features:beginStandup');
const { ActivityFactory, TemplateEngine } = require('botbuilder-lg');
const path = require('path');
let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));
exports.default = (handler) => {
    handler.onMessage((context, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (context.activity.text) {
            debug('evaluating text for start command:', context.activity.text);
            if (context.activity.text.match(/^(start|begin)/i)) {
                if (context.activity.conversation.conversationType === 'channel') {
                    // todo: test to see if this is part of an ongoing 
                    return yield handler.triggerEvent(context, 'beginStandup', next);
                }
                else {
                    return yield handler.triggerEvent(context, 'beginStandupUsage', next);
                }
            }
        }
        yield next();
    }));
    handler.handleEvent('beginStandupUsage', (context, next) => __awaiter(void 0, void 0, void 0, function* () {
        yield context.sendActivity(lgEngine.evaluateTemplate("BeginStandupUsage"));
        yield next();
    }));
    handler.handleEvent('beginStandup', (context, next) => __awaiter(void 0, void 0, void 0, function* () {
        // first, we need to get the channel id.
        const reference = botbuilder_1.TurnContext.getConversationReference(context.activity);
        const teamDetails = yield botbuilder_1.TeamsInfo.getTeamDetails(context);
        const channelList = yield botbuilder_1.TeamsInfo.getTeamChannels(context);
        const thisChannel = channelList.filter((channel) => { return reference.conversation.id.indexOf(channel.id) === 0; });
        const channelId = thisChannel[0].id;
        let currentStandup = yield handler.db.getStandupForChannel(channelId);
        if (currentStandup) {
            debug('end current standup: ', currentStandup);
            // end this standup.
            // perhaps we want to do some final action here, like update the card to REMOVE THE BUTTON
            let activity = ActivityFactory.createActivity(lgEngine.evaluateTemplate("CompletedMeetingCard", currentStandup));
            activity.id = currentStandup.original_card;
            yield context.updateActivity(activity);
            // delete the record
            yield handler.db.deleteStandupForChannel(channelId);
        }
        const startStandUpCard = ActivityFactory.createActivity(lgEngine.evaluateTemplate("StartStandUpCard"));
        const results = yield context.sendActivity(startStandUpCard);
        currentStandup = {};
        currentStandup.startTime = new Date();
        currentStandup.original_card = results.id;
        currentStandup.channelId = channelId;
        currentStandup.channel = thisChannel[0].name || 'General';
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
        yield handler.db.saveStandup(currentStandup);
        yield next();
    }));
};
//# sourceMappingURL=beginStandup.js.map