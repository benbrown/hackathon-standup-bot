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
const Debug = require("debug");
const debug = Debug('bot:features:beginStandup');
const { ActivityFactory, TemplateEngine } = require('botbuilder-lg');
const path = require('path');
let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));
exports.default = (handler) => {
    handler.onMessage((context, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (context.activity.text) {
            debug('evaluating text for a command', context.activity.text);
            if (context.activity.text.match(/^(summary)/i)) {
                return yield handler.triggerEvent(context, 'showSummaryCard', next);
            }
        }
        yield next();
    }));
    handler.handleEvent('showSummaryCard', (context, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            team: "Standup",
            channel: "stand-up bot",
            questions: [
                question_1,
                question_2,
                question_3
            ]
        };
        yield context.sendActivity(ActivityFactory.createActivity(lgEngine.evaluateTemplate("ActiveMeetingCard", summary)));
        yield next();
    }));
};
//# sourceMappingURL=showSummary.js.map