// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  TurnContext,
  TeamsActivityHandler,
  BotHandler,
} from 'botbuilder';

import * as Debug from 'debug'
import * as path from 'path';
import * as fs from 'fs';

const debug = Debug('bot:handler');

export class Handler extends TeamsActivityHandler {
  constructor() {
    super();
  
    // strip the @mention from the message so the bot doesn't have to deal with this internally
    this.onMessage(async(context, next) => {
      TurnContext.removeRecipientMention(context.activity);
      await next();
    });

    this.loadFeatures(path.join(__dirname,'features'));

  }

  // expose these methods publicly so features can take advantage of the activity handler event system
  public handleEvent = (type: string, handler: BotHandler) => {
    debug('Register handler for ', type);
    this.on(type, handler);
  }

  public triggerEvent = async (context: TurnContext, type: string, onNext: ()=>Promise<void>): Promise<void> => {
    debug('Trigger custom event', type);
    return this.handle(context, type, onNext);
  }

  public loadFeatures = (location: string) => {
      debug('loading features from ', location);
      // find all feature modules in a given folder, load them up, execute them
      const features = fs.readdirSync(location);
      for (const f in features) {
        const module_path = path.join(location, features[f]);
        if (module_path.match(/.js$/)) {
          this.loadFeature(module_path);
        }
      }
  }

  private loadFeature = (location: string) => {
    debug('Load feature from ', location);
    const module: {default: (handler: TeamsActivityHandler) => void} = require(location);
    module.default(this);
  }
}