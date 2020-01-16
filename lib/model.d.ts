import { Storage } from 'botbuilder';
export interface StandupRec {
    [key: string]: any;
}
export declare class Datastore {
    private storage;
    constructor(storage: Storage);
    getStandupForChannel(channelId: string): Promise<any>;
    saveStandup(standup: StandupRec): Promise<void>;
    deleteStandupForChannel(channelId: string): Promise<void>;
    setScheduleForChannel(channelId: string, schedule: any): Promise<void>;
    getScheduleForChannel(channelId: string): Promise<any>;
    private makeKey;
}
