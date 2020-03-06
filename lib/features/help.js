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
const debug = Debug('bot:features:showSchedule');
const { ActivityFactory, TemplateEngine } = require('botbuilder-lg');
const path = require('path');
let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));
exports.default = (handler) => {
    handler.onMessage((context, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (context.activity.text) {
            debug('evaluating text for a command', context.activity.text);
            if (context.activity.text.match(/^(help)/i)) {
                return yield handler.triggerEvent(context, 'showHelp', next);
            }
        }
        yield next();
    }));
    handler.handleEvent('showHelp', (context, next) => __awaiter(void 0, void 0, void 0, function* () {
        yield context.sendActivity(ActivityFactory.createActivity(lgEngine.evaluateTemplate("HelpCard")));
        yield next();
    }));
};
//# sourceMappingURL=help.js.map