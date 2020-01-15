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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const Debug = require("debug");
const path = require("path");
const fs = require("fs");
const model_1 = require("./model");
const debug = Debug('bot:handler');
class Handler extends botbuilder_1.TeamsActivityHandler {
    constructor(storage) {
        super();
        this.addDialog = (dialog) => {
            debug('Adding dialog', dialog.id);
            this.dialogSet.add(dialog);
        };
        this.saveState = (context) => __awaiter(this, void 0, void 0, function* () {
            this.conversationState.saveChanges(context, false);
        });
        // expose these methods publicly so features can take advantage of the activity handler event system
        this.handleEvent = (type, handler) => {
            debug('Register handler for ', type);
            this.on(type, handler);
        };
        this.triggerEvent = (context, type, onNext) => __awaiter(this, void 0, void 0, function* () {
            debug('Trigger custom event', type);
            return this.handle(context, type, onNext);
        });
        this.loadFeatures = (location) => {
            debug('loading features from ', location);
            // find all feature modules in a given folder, load them up, execute them
            const features = fs.readdirSync(location);
            for (const f in features) {
                const module_path = path.join(location, features[f]);
                if (module_path.match(/.js$/)) {
                    this.loadFeature(module_path);
                }
            }
        };
        this.loadFeature = (location) => {
            debug('Load feature from ', location);
            const module = require(location);
            module.default(this);
        };
        this.storage = storage;
        this.conversationState = new botbuilder_1.ConversationState(this.storage);
        this.dialogState = this.conversationState.createProperty('DIALOG_STATE');
        this.dialogSet = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        // configure the model accessor
        this.db = new model_1.Datastore(this.storage);
        // strip the @mention from the message so the bot doesn't have to deal with this internally
        this.onMessage((context, next) => __awaiter(this, void 0, void 0, function* () {
            botbuilder_1.TurnContext.removeRecipientMention(context.activity);
            const dialogContext = yield this.dialogSet.createContext(context);
            const results = yield dialogContext.continueDialog();
            if (results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
                debug('Dialog results are empty, continuing...');
                yield next();
            }
            else {
                // DO NOT call next here because we don't want other handlers firing.
                // instead, jump to the last step IE save state and end.
                // await next();
                yield this.saveState(context);
            }
        }));
        this.onDialog((context, next) => __awaiter(this, void 0, void 0, function* () {
            debug('Saving conversation state!');
            yield this.saveState(context);
            yield next();
        }));
        this.loadFeatures(path.join(__dirname, 'features'));
    }
}
exports.Handler = Handler;
//# sourceMappingURL=handler.js.map