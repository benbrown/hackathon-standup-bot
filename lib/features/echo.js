"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const Debug = require("debug");
const debug = Debug('bot:features:echo');
debug('loading echo feature');
exports.default = (handler) => {
    // handler.onMessage(async(context, next) => {
    //     debug('echoing incoming message', context.activity.text);
    //     await context.sendActivity('Echo: ' + context.activity.text);
    //     await next();
    // });
};
//# sourceMappingURL=echo.js.map