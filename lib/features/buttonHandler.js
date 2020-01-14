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
debug('loading echo feature');
exports.default = (handler) => {
    handler.onMessage((context, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (context.activity.value && context.activity.value.command == 'begin') {
            return yield handler.triggerEvent(context, 'standupButtonClicked', next);
        }
        yield next();
    }));
    handler.handleEvent('standupButtonClicked', (context, next) => __awaiter(void 0, void 0, void 0, function* () {
        let ref = botbuilder_1.TurnContext.getConversationReference(context.activity);
        // get more specific about what type of adapter this is cause the botadapter base class doesn't have createConversation and ts is complaining
        const adapter = context.adapter;
        // create a 1:1 context...
        yield adapter.createConversation(ref, (private_context) => __awaiter(void 0, void 0, void 0, function* () {
            // I think we need to create a new dialog context here
            // and begin the dialog
            // and then save the state again...
            const dialogContext = yield handler.dialogSet.createContext(private_context);
            yield dialogContext.beginDialog('STANDUP', {
                originalContext: ref,
                user: context.activity.from,
            });
            yield handler.saveState(private_context);
            // todo: not sure if we should call this inside the callback or outside...
            yield next();
        }));
    }));
};
//# sourceMappingURL=buttonHandler.js.map