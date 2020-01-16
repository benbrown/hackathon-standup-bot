// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  TurnContext,
  TeamsActivityHandler,
  BotHandler,
  ConversationState,
  StatePropertyAccessor,
  Storage,
  TaskModuleRequest,
  TeamsInfo,
  TaskModuleResponse
} from 'botbuilder';

import {
  Dialog,
  DialogSet,
  DialogTurnStatus
} from 'botbuilder-dialogs';

import * as Debug from 'debug'
import * as path from 'path';
import * as fs from 'fs';

import { Datastore } from './model';

const { ActivityFactory, TemplateEngine } = require('botbuilder-lg');
const lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../resources/standupPrompts.lg'));

const debug = Debug('bot:handler');

export class Handler extends TeamsActivityHandler {
  private conversationState: ConversationState;
  private dialogState: StatePropertyAccessor<any>;
  public dialogSet: DialogSet;
  private storage: Storage;
  public db: Datastore;

  constructor(storage: Storage) {
    super();

    this.storage = storage;
    this.conversationState = new ConversationState(this.storage);
    this.dialogState = this.conversationState.createProperty('DIALOG_STATE');
    this.dialogSet = new DialogSet(this.dialogState);

    // configure the model accessor
    this.db = new Datastore(this.storage);
    
    // strip the @mention from the message so the bot doesn't have to deal with this internally
    this.onMessage(async(context, next) => {
      TurnContext.removeRecipientMention(context.activity);

      const dialogContext = await this.dialogSet.createContext(context);
      const results = await dialogContext.continueDialog();
      if (results.status === DialogTurnStatus.empty) {
        debug('Dialog results are empty, continuing...')
        await next();
      } else {
        // DO NOT call next here because we don't want other handlers firing.
        // instead, jump to the last step IE save state and end.
        // await next();
        await this.saveState(context);
      }
    });

    this.onDialog(async(context, next) => {
      debug('Saving conversation state!');
      await this.saveState(context);
      await next();
    });

    this.loadFeatures(path.join(__dirname,'features'));

  }

  public addDialog = (dialog: Dialog):void => {
    debug('Adding dialog', dialog.id);
    this.dialogSet.add(dialog);
  }

  public saveState = async(context: TurnContext) => {
    this.conversationState.saveChanges(context, false);
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

  protected async handleTeamsTaskModuleFetch(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<any> {

    const channelList = await TeamsInfo.getTeamChannels(context);
    const thisChannel = channelList.filter((channel) => { return context.activity.conversation.id.indexOf(channel.id) === 0 });
    const channelId = thisChannel[0].id;

    let schedule = await this.db.getScheduleForChannel(channelId);

    debug('got current schedule', schedule);

    if (!schedule) {
      schedule = {
        Monday: 'true',
        Tuesday: 'true',
        Wednesday: 'true',
        Thursday: 'true',
        Friday: 'true',
        Saturday: 'false',
        Sunday: 'false',
        MeetingTime: '10:00 AM'
      }
    }

    const message = ActivityFactory.createActivity(lgEngine.evaluateTemplate("ScheduleCard", {schedule: schedule}));

    return {
      task: {
          type: 'continue',
          value: {
              card: message.attachments[0],
              height: 450,
              width: 400,
              title: 'Schedule'
          }
      }
    };
  }

  protected async handleTeamsTaskModuleSubmit(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<any> {
    await this.triggerEvent(context, 'updateSchedule', async() => {});
    return;
  }

}