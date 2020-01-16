// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Storage } from 'botbuilder';

export interface StandupRec {
  [key: string]: any,
}

export class Datastore {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  public async getStandupForChannel(channelId: string) {
    const res = await this.storage.read([this.makeKey(channelId)]);
    if (res[this.makeKey(channelId)]) {
      return res[this.makeKey(channelId)];
    } else {
      return null;
    }
  }

  public async saveStandup(standup: StandupRec) {
    let changes = {};
    changes[this.makeKey(standup.channelId)] = standup;
    return await this.storage.write(changes);
  }

  public async deleteStandupForChannel(channelId: string) {
    return await this.storage.delete([this.makeKey(channelId)]);
  }

  public async setScheduleForChannel(channelId: string, schedule: any) {
    let res = await this.storage.read(['schedule']);
    let current_schedule= {};  
    if (res['schedule']) {
      current_schedule = res['schedule'];
    } else {
      current_schedule = {};
    }
    current_schedule[channelId] = schedule;
    return await this.storage.write({'schedule': current_schedule});
  }

  public async getScheduleForChannel(channelId: string) {
    let res = await this.storage.read(['schedule']);
    let current_schedule= {};  
    if (res['schedule']) {
      current_schedule = res['schedule'];
    } else {
      current_schedule = {};
    }

    return current_schedule[channelId];
  }

  public async getSchedule() {
    let res = await this.storage.read(['schedule']);
    let current_schedule= {};  
    if (res['schedule']) {
      current_schedule = res['schedule'];
    } else {
      current_schedule = {};
    }
    return current_schedule;
  }

  private makeKey(channelId: string) {
    return `${ channelId }-standup`;
  }

}
