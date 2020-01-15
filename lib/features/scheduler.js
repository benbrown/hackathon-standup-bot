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
const Recognizers = require("@microsoft/recognizers-text-date-time");
const Debug = require("debug");
const debug = Debug('bot:features:beginStandup');
exports.default = (handler) => {
    handler.onMessage((context, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (context.activity.text && context.activity.text.match(/^schedule/)) {
            let local_parse = Recognizers.recognizeDateTime(context.activity.text, Recognizers.Culture.English);
            // debug('GOT LOCAL PARSE', JSON.stringify(local_parse, null, 2));
            if (local_parse.length) {
                let times = [];
                local_parse.forEach((r) => {
                    times.push(r.resolution.values[0]);
                });
                let schedule = yield determineSchedule(times);
                debug('GOT SCHEDULE', JSON.stringify(schedule, null, 2));
            }
            else {
                // did not find a date
            }
        }
    }));
    function determineSchedule(times) {
        return __awaiter(this, void 0, void 0, function* () {
            debug('determine schedule based on ', times);
            let schedule = {
                type: 'once',
                time: null,
            };
            // are any of the datetime entities sets?
            if (times.filter((t) => { return t.type === 'set'; }).length) {
                schedule.type = 'repeating';
                schedule.time = getSchedule(times);
            }
            else {
                // is there just 1 time? if so, get it.
                if (times.length === 1) {
                    schedule.time = timextotime(times[0].timex);
                }
                else {
                    schedule.time = getSchedule(times);
                }
            }
            return schedule;
        });
    }
    function getSchedule(times) {
        let schedule = {
            timex: times,
            hour: null,
            minute: null,
            year: null,
            month: null,
            date: null,
            dayofweek: null,
            weekNumber: null,
            interval: null,
            dayofweekInterval: null,
        };
        times.forEach((thistime) => {
            debug('consider', thistime);
            if (thistime.type === 'time') {
                let time = timextotime(thistime.timex);
                for (let key in time) {
                    schedule[key] = time[key];
                }
            }
            else if (thistime.type === 'set') {
                let timex = thistime.timex;
                // todo: what if there are multiples?
                if (timex.match(/T(\d+)/)) {
                    let match = timex.match(/T(\d+)/);
                    schedule.hour = parseInt(match[1]);
                }
                else {
                    // TODO: set a sane hour
                    // like, some time from now
                }
                if (timex.match(/T..:(\d+)/)) {
                    let match = timex.match(/T..:(\d+)/);
                    schedule.minute = parseInt(match[1]);
                }
                if (timex.match(/....-W..-(\d)/)) {
                    let match = timex.match(/....-W..-(\d)/);
                    schedule.dayofweek = parseInt(match[1]);
                }
                if (timex.match(/^....-(\d\d)/)) {
                    let match = timex.match(/^....-(\d\d)/);
                    schedule.month = parseInt(match[1]) - 1;
                }
                if (timex.match(/^....-..-(\d\d)/)) {
                    let match = timex.match(/^....-..-(\d\d)/);
                    schedule.date = parseInt(match[1]);
                }
                if (timex.match(/P(\d+)D/)) {
                    let match = timex.match(/P(\d+)D/);
                    let interval = parseInt(match[1]);
                    schedule.interval = interval + ' days';
                    if (interval === 1) {
                        schedule.date = '*';
                    }
                    else {
                        schedule.date = '*/' + interval;
                    }
                }
                if (timex.match(/P(\d+)W/)) {
                    let match = timex.match(/P(\d+)W/);
                    let interval = parseInt(match[1]);
                    schedule.interval = interval + ' weeks';
                    if (interval === 1) {
                        schedule.dayofweekInterval = '*';
                    }
                    else {
                        schedule.dayofweekInterval = interval;
                    }
                    if (!schedule.dayofweek) {
                        schedule.dayofweek = 1; // todo: default to monday, but should be relative to today?
                    }
                }
                if (timex.match(/P(\d+)M/)) {
                    let match = timex.match(/P(\d+)M/);
                    let interval = parseInt(match[1]);
                    schedule.interval = interval + ' months';
                    if (interval === 1) {
                        schedule.month = '*';
                    }
                    else {
                        schedule.month = '*/' + interval;
                    }
                    if (!schedule.date) {
                        schedule.date = 1; // todo: should this default to today's date? or the 1st?
                    }
                }
            }
            else if (thistime.type === 'date' || thistime.type === 'datetime') {
                let timex = thistime.timex;
                // todo: what if there are multiples?
                if (timex.match(/T(\d+)/)) {
                    let match = timex.match(/T(\d+)/);
                    schedule.hour = parseInt(match[1]);
                }
                else {
                    // TODO: set a sane hour
                    // like, some time from now
                }
                if (timex.match(/T..:(\d+)/)) {
                    let match = timex.match(/T..:(\d+)/);
                    schedule.minute = parseInt(match[1]);
                }
                if (timex.match(/^(\d\d\d\d)-/)) {
                    let match = timex.match(/^(\d\d\d\d)-/);
                    schedule.year = parseInt(match[1]);
                }
                if (timex.match(/^....-(\d\d)/)) {
                    let match = timex.match(/^....-(\d\d)/);
                    schedule.month = parseInt(match[1]) - 1;
                }
                if (timex.match(/^....-..-(\d\d)/)) {
                    let match = timex.match(/^....-..-(\d\d)/);
                    schedule.date = parseInt(match[1]);
                }
                if (timex.match(/....-W..-(\d)/)) {
                    let match = timex.match(/....-W..-(\d)/);
                    schedule.dayofweek = parseInt(match[1]);
                }
            }
            else if (thistime.type === 'daterange') {
                let timex = thistime.timex;
                if (timex.match(/\d\d\d\d-W(\d+)/)) {
                    let match = timex.match(/\d\d\d\d-W(\d+)/);
                    schedule.weekNumber = parseInt(match[1]);
                }
                if (timex.match(/....-(\d+)/)) {
                    let match = timex.match(/....-(\d+)/);
                    schedule.month = parseInt(match[1]);
                }
            }
        });
        return schedule;
    }
    function timextotime(timex) {
        let time = {
            timex: null,
            hour: null,
            minute: null,
            year: null,
            month: null,
            date: null,
            dayofweek: null,
            weekNumber: null,
        };
        time.timex = timex;
        debug('timex to time', timex);
        if (timex.match(/T(\d+)/)) {
            let match = timex.match(/T(\d+)/);
            time.hour = parseInt(match[1]);
        }
        else {
            // TODO: set a sane hour
            // like, some time from now
        }
        if (timex.match(/T..:(\d+)/)) {
            let match = timex.match(/T..:(\d+)/);
            time.minute = parseInt(match[1]);
        }
        if (timex.match(/^(\d\d\d\d)-/)) {
            let match = timex.match(/^(\d\d\d\d)-/);
            time.year = parseInt(match[1]);
        }
        if (timex.match(/^....-(\d\d)/)) {
            let match = timex.match(/^....-(\d\d)/);
            time.month = parseInt(match[1]) - 1;
        }
        if (timex.match(/^....-..-(\d\d)/)) {
            let match = timex.match(/^....-..-(\d\d)/);
            time.date = parseInt(match[1]);
        }
        if (timex.match(/....-W..-(\d)/)) {
            let match = timex.match(/....-W..-(\d)/);
            time.dayofweek = parseInt(match[1]);
        }
        if (timex.match(/\d\d\d\d-W(\d+)/)) {
            let match = timex.match(/\d\d\d\d-W(\d+)/);
            time.weekNumber = parseInt(match[1]);
            // translate this to the day and month
        }
        debug('resulting time', time);
        return time;
    }
};
//# sourceMappingURL=scheduler.js.map