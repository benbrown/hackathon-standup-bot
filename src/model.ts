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

  }

  private makeKey(channelId: string) {
    return `${ channelId }-standup`;
  }

}
