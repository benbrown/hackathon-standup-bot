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
const card_json = {
    "type": "AdaptiveCard",
    "version": "1.0",
    "body": [
        {
            "type": "TextBlock",
            "text": "It's time for a stand-up! Click the button below to start yours."
        },
        {
            "type": "ActionSet",
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": "Begin My Stand-up",
                    "style": "positive",
                    "id": "begin",
                    "data": {
                        "command": "begin"
                    },
                }
            ]
        }
    ],
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
};
exports.default = (handler) => {
    handler.onMessage((context, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (context.activity.text) {
            debug('evaluating text for a command', context.activity.text);
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
        yield context.sendActivity('To begin a stand-up, say @standup begin inside a Team chat. I cannot start a new stand-up from inside a 1:1 chat.');
        yield next();
    }));
    handler.handleEvent('beginStandup', (context, next) => __awaiter(void 0, void 0, void 0, function* () {
        const reference = botbuilder_1.TurnContext.getConversationReference(context.activity);
        debug('got conversation reference', reference);
        yield context.sendActivity({
            text: 'Hello',
            attachments: [
                botbuilder_1.CardFactory.adaptiveCard(card_json)
            ]
        });
        yield next();
    }));
};
//# sourceMappingURL=beginStandup.js.map