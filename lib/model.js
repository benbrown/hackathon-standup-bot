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
class Datastore {
    constructor(storage) {
        this.storage = storage;
    }
    getStandupForChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.storage.read([this.makeKey(channelId)]);
            if (res[this.makeKey(channelId)]) {
                return res[this.makeKey(channelId)];
            }
            else {
                return null;
            }
        });
    }
    saveStandup(standup) {
        return __awaiter(this, void 0, void 0, function* () {
            let changes = {};
            changes[this.makeKey(standup.channelId)] = standup;
            return yield this.storage.write(changes);
        });
    }
    deleteStandupForChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.storage.delete([this.makeKey(channelId)]);
        });
    }
    setScheduleForChannel(channelId, schedule) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.storage.read(['schedule']);
            let current_schedule = {};
            if (res['schedule']) {
                current_schedule = res['schedule'];
            }
            else {
                current_schedule = {};
            }
            current_schedule[channelId] = schedule;
            return yield this.storage.write({ 'schedule': current_schedule });
        });
    }
    getScheduleForChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.storage.read(['schedule']);
            let current_schedule = {};
            if (res['schedule']) {
                current_schedule = res['schedule'];
            }
            else {
                current_schedule = {};
            }
            return current_schedule[channelId];
        });
    }
    getSchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.storage.read(['schedule']);
            let current_schedule = {};
            if (res['schedule']) {
                current_schedule = res['schedule'];
            }
            else {
                current_schedule = {};
            }
            return current_schedule;
        });
    }
    makeKey(channelId) {
        return `${channelId}-standup`;
    }
}
exports.Datastore = Datastore;
//# sourceMappingURL=model.js.map