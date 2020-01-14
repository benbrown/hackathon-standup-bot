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
exports.default = (handler) => {
    const standupPrompt = new botbuilder_dialogs_1.TextPrompt('TEXTPROMPT');
    const standupDialog = new botbuilder_dialogs_1.WaterfallDialog('STANDUP', [
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            step.values['answers'] = [];
            return yield step.prompt('TEXTPROMPT', 'What have you been working on since last stand-up?');
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            step.values['answers'].push(step.result);
            return yield step.prompt('TEXTPROMPT', 'What will you be working on til our next stand-up?');
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            step.values['answers'].push(step.result);
            return yield step.prompt('TEXTPROMPT', 'Is there anything blocking your progress?');
        }),
        (step) => __awaiter(void 0, void 0, void 0, function* () {
            step.values['answers'].push(step.result);
            const results = {
                answers: step.values['answers'],
                originalContext: step.options['originalContext'],
                user: step.options['user'],
            };
            debug('Final results', results);
            yield deliverReportToChannel(step.context.adapter, results);
            return yield step.endDialog(results);
        })
    ]);
    const deliverReportToChannel = (adapter, results) => __awaiter(void 0, void 0, void 0, function* () {
        yield adapter.continueConversation(results.originalContext, (context) => __awaiter(void 0, void 0, void 0, function* () {
            yield context.sendActivity(`${results.user.name} finished a stand-up: \`\`\`${JSON.stringify(results.answers, null, 2)}\`\`\``);
        }));
    });
    // make the standup dialog available
    handler.addDialog(standupDialog);
    handler.addDialog(standupPrompt);
};
//# sourceMappingURL=standupDialog.js.map