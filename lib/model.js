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
// super simple memory datastore that will... do for now.
let data = {};
class Datastore {
    constructor(options) {
        this.options = options;
        // do something like connect to a real database
    }
    set(key, val) {
        return __awaiter(this, void 0, void 0, function* () {
            data[key] = val;
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data[key]) {
                return data[key];
            }
            return null;
        });
    }
}
exports.default = new Datastore({});
//# sourceMappingURL=model.js.map