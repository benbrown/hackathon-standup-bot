import { WaterfallDialog } from 'botbuilder-dialogs';

export const standupDialog = new WaterfallDialog('STANDUP', [
  async(step) => {
    await step.context.sendActivity('hi');
    return await step.next();
  }, 
  async(step) => {
    await step.context.sendActivity('hi 2');
    return await step.next();
  }, 
]);

