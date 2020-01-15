"use strict";
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
const debug = Debug('bot:dialog:standup');
const { TemplateEngine } = require('botbuilder-lg');
const path = require('path');
let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));
exports.default = (handler) => {
    const standupPrompt = new botbuilder_dialogs_1.TextPrompt('TEXTPROMPT');
    const standupDialog = new botbuilder_dialogs_1.WaterfallDialog('STANDUP', [
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            let user = step.options['user'].name;
            let teamName = step.options['team'].name;
            let channelName = step.options['channel'].name;
            step.values['answers'] = [];
            yield step.context.sendActivity(lgEngine.evaluateTemplate("BeginStandup", { user, teamName, channelName }));
            return yield step.next();
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            return yield step.prompt('TEXTPROMPT', lgEngine.evaluateTemplate("WorkingOnPastPrompt"));
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            step.values['answers'].push(step.result);
            return yield step.prompt('TEXTPROMPT', lgEngine.evaluateTemplate("WorkingOnNextPrompt"));
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            step.values['answers'].push(step.result);
            return yield step.prompt('TEXTPROMPT', lgEngine.evaluateTemplate("BlockerPrompt"));
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            step.values['answers'].push(step.result);
            const results = {
                answers: step.values['answers'],
                originalContext: step.options['originalContext'],
                user: step.options['user'],
                original_card: step.options['original_card'],
            };
            debug('Final results', results);
            yield step.context.sendActivity(lgEngine.evaluateTemplate("ThankUserForCompletion"));
            yield deliverReportToChannel(step.context.adapter, results, step.context);
            return yield step.endDialog(results);
        })
    ]);
    const deliverReportToChannel = (adapter, results, context) => __awaiter(void 0, void 0, void 0, function* () {
        yield adapter.continueConversation(results.originalContext, (context) => __awaiter(void 0, void 0, void 0, function* () {
            yield context.sendActivity(`${results.user.name} finished a stand-up: \`\`\`${JSON.stringify(results.answers, null, 2)}\`\`\``);
            // update the original card with new stuff
            let activity = botbuilder_1.MessageFactory.text(`${results.user.name} finished a stand-up: \`\`\`${JSON.stringify(results.answers, null, 2)}\`\`\``);
            activity.id = results.original_card;
            debug('CARD TO UPDATE', activity);
            yield context.updateActivity(activity);
        }));
    });
    // make the standup dialog available
    handler.addDialog(standupDialog);
    handler.addDialog(standupPrompt);
};
//# sourceMappingURL=standupDialog.js.map