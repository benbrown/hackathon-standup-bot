import { WaterfallDialog, TextPrompt } from 'botbuilder-dialogs';
import * as Debug from 'debug'
const debug = Debug('bot:dialog:standup');

export const standupPrompt = new TextPrompt('TEXTPROMPT');

export const standupDialog = new WaterfallDialog('STANDUP', [
  async(step) => {
    step.values['answers'] = [];
    return await step.prompt('TEXTPROMPT','What have you been working on since last stand-up?');
  }, 
  async(step) => {
    step.values['answers'].push(step.result);
    return await step.prompt('TEXTPROMPT','What will you be working on til our next stand-up?');
  }, 
  async(step) => {
    step.values['answers'].push(step.result);
    return await step.prompt('TEXTPROMPT','Is there anything blocking your progress?');
  }, 
  async(step) => {
    step.values['answers'].push(step.result);
    const results = {
      answers: step.values['answers'],
    };

    debug('Final results', results);

    return await step.endDialog(results);
  }
]);

