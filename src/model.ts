// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// super simple memory datastore that will... do for now.
let data = {};

interface ops {[key: string]: any}

class Datastore {
  options: ops;

  constructor(options: ops) {
    this.options = options;

    // do something like connect to a real database
  }

  public async set(key: string, val: any): Promise<void> {
    data[key] = val;
  }

  public async get(key): Promise<any> {
    if (data[key]) {
      return data[key];
    } 
    return null;
  } 

}


export default new Datastore({});