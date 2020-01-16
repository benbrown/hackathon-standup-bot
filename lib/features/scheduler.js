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
const debug = Debug('bot:features:scheduler');
const { TemplateEngine } = require('botbuilder-lg');
const path = require('path');
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
        const teamDetails = yield botbuilder_1.TeamsInfo.getTeamDetails(context);
        const channelList = yield botbuilder_1.TeamsInfo.getTeamChannels(context);
        const thisChannel = channelList.filter((channel) => { return reference.conversation.id.indexOf(channel.id) === 0; });
        const channelId = thisChannel[0].id;
        const card = botbuilder_1.CardFactory.heroCard('Stand-up Schedule', 'Current schedule is...', null, // No images
        [{ type: 'invoke', title: 'Change Schedule', value: { type: 'task/fetch', data: 'adaptivecard' } }]);
        const message = botbuilder_1.MessageFactory.attachment(card);
        yield context.sendActivity(message);
        yield next();
    }));
};
//# sourceMappingURL=scheduler.js.map