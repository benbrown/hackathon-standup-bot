import { TurnContext, TeamsActivityHandler, BotHandler, Storage } from 'botbuilder';
import { Dialog, DialogSet } from 'botbuilder-dialogs';
import { Datastore } from './model';
export declare class Handler extends TeamsActivityHandler {
    private conversationState;
    private dialogState;
    dialogSet: DialogSet;
    private storage;
    db: Datastore;
    constructor(storage: Storage);
    addDialog: (dialog: Dialog<{}>) => void;
    saveState: (context: TurnContext) => Promise<void>;
    handleEvent: (type: string, handler: BotHandler) => void;
    triggerEvent: (context: TurnContext, type: string, onNext: () => Promise<void>) => Promise<void>;
    loadFeatures: (location: string) => void;
    private loadFeature;
}
