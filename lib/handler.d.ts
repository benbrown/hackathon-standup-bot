import { TurnContext, TeamsActivityHandler, BotHandler, ConversationState } from 'botbuilder';
import { Dialog, DialogSet } from 'botbuilder-dialogs';
export declare class Handler extends TeamsActivityHandler {
    private conversationState;
    private dialogState;
    dialogSet: DialogSet;
    constructor(stateDriver: ConversationState);
    addDialog: (dialog: Dialog<{}>) => void;
    saveState: (context: TurnContext) => Promise<void>;
    handleEvent: (type: string, handler: BotHandler) => void;
    triggerEvent: (context: TurnContext, type: string, onNext: () => Promise<void>) => Promise<void>;
    loadFeatures: (location: string) => void;
    private loadFeature;
}
