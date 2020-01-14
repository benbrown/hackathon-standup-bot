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
exports.default = (handler) => {
    handler.onMessage((context, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield next();
    }));
    handler.handleEvent('beginStandupUsage', (context, next) => __awaiter(void 0, void 0, void 0, function* () {
        yield context.sendActivity('To begin a stand-up, say @standup begin inside a Team chat. I cannot start a new stand-up from inside a 1:1 chat.');
        yield next();
    }));
};
//# sourceMappingURL=beginStandup.js.map