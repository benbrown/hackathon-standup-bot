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
exports.standupDialog = new botbuilder_dialogs_1.WaterfallDialog('STANDUP', [
    (step) => __awaiter(void 0, void 0, void 0, function* () {
        yield step.context.sendActivity('hi');
        return yield step.next();
    }),
    (step) => __awaiter(void 0, void 0, void 0, function* () {
        yield step.context.sendActivity('hi 2');
        return yield step.next();
    }),
]);
//# sourceMappingURL=standup.js.map