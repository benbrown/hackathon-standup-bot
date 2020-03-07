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
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const Debug = require("debug");
const debug = Debug('bot:dialog:standup');
const { ActivityFactory, TemplateEngine } = require('botbuilder-lg');
const path = require('path');
let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));
exports.default = (handler) => {
    const standupPrompt = new botbuilder_dialogs_1.TextPrompt('TEXTPROMPT');
    const standupDialog = new botbuilder_dialogs_1.WaterfallDialog('STANDUP', [
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            let user = step.options['user'].name;
            let teamName = step.options['team'];
            let channelName = step.options['channel'];
            step.values['answers'] = [];
            yield step.context.sendActivity(lgEngine.evaluateTemplate("BeginStandup", { user, teamName, channelName }));
            return yield step.next();
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            return yield step.prompt('TEXTPROMPT', lgEngine.evaluateTemplate("WorkingOnPastPrompt"));
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            step.values['answers'].push(sanitizeResponse(step.result));
            return yield step.prompt('TEXTPROMPT', lgEngine.evaluateTemplate("WorkingOnNextPrompt"));
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            step.values['answers'].push(sanitizeResponse(step.result));
            return yield step.prompt('TEXTPROMPT', lgEngine.evaluateTemplate("BlockerPrompt"));
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            step.values['answers'].push(sanitizeResponse(step.result));
            const results = {
                answers: step.values['answers'],
                originalContext: step.options['originalContext'],
                channelId: step.options['channelId'],
                user: step.options['user'],
            };
            debug('Final results', results);
            yield step.context.sendActivity(lgEngine.evaluateTemplate("ThankUserForCompletion"));
            yield deliverReportToChannel(step.context.adapter, results);
            return yield step.endDialog(results);
        })
    ]);
    function sanitizeResponse(result) {
        console.debug(result);
        return result.replace(/(\n)/gm, "\\n");
    }
    const deliverReportToChannel = (adapter, results) => __awaiter(void 0, void 0, void 0, function* () {
        yield adapter.continueConversation(results.originalContext, (context) => __awaiter(void 0, void 0, void 0, function* () {
            let currentStandup = yield handler.db.getStandupForChannel(results.channelId);
            // add the user id to the list of users who have already responded to this.
            currentStandup.respondees.push(results.user.id);
            // update this record with this user's answers
            for (let x = 0; x < results.answers.length; x++) {
                currentStandup.questions[x].participants.push({
                    id: results.user.id,
                    name: results.user.name,
                    response: results.answers[x],
                });
            }
            yield handler.db.saveStandup(currentStandup);
            // await context.sendActivity(`${ results.user.name } finished a stand-up: \`\`\`${ JSON.stringify(results.answers, null, 2) }\`\`\``);
            yield context.sendActivity(`${results.user.name} finished the stand-up.`);
            // update the original card with new stuff
            let activity = ActivityFactory.createActivity(lgEngine.evaluateTemplate("ActiveMeetingCard", currentStandup));
            activity.id = currentStandup.original_card;
            // await context.sendActivity(activity);
            debug('CARD TO UPDATE', activity);
            yield context.updateActivity(activity);
        }));
    });
    // make the standup dialog available
    handler.addDialog(standupDialog);
    handler.addDialog(standupPrompt);
};
//# sourceMappingURL=standupDialog.js.map