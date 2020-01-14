import { TurnContext, TeamsActivityHandler, BotHandler } from 'botbuilder';
export declare class Handler extends TeamsActivityHandler {
    constructor();
    handleEvent: (type: string, handler: BotHandler) => void;
    triggerEvent: (context: TurnContext, type: string, onNext: () => Promise<void>) => Promise<void>;
    loadFeatures: (location: string) => void;
    private loadFeature;
}
