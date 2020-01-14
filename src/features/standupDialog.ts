import { BotFrameworkAdapter } from 'botbuilder';
import { WaterfallDialog, TextPrompt } from 'botbuilder-dialogs';
import * as Debug from 'debug'
import { Handler } from '../handler';

const debug = Debug('bot:dialog:standup');

export default (handler: Handler) => {

  const standupPrompt = new TextPrompt('TEXTPROMPT');

  const standupDialog = new WaterfallDialog('STANDUP', [
    async(step) => {
      step.values['answers'] = [];
      await step.context.sendActivity(`This is the stand-up for ${ step.options['team'].name } / ${ step.options['channel'].name }. Let's get started!`);
      return await step.next();
    }, 
    async(step) => {
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
        originalContext: step.options['originalContext'],
        user: step.options['user'],
      };

      debug('Final results', results);

      await step.context.sendActivity('Thanks for taking the time to respond!');

      await deliverReportToChannel(step.context.adapter as BotFrameworkAdapter, results);

      return await step.endDialog(results);
    }
  ]);

  const deliverReportToChannel = async(adapter: BotFrameworkAdapter, results: any): Promise<void> => {
    await adapter.continueConversation(results.originalContext, async(context) => {
      await context.sendActivity(`${ results.user.name } finished a stand-up: \`\`\`${ JSON.stringify(results.answers, null, 2) }\`\`\``);
    });
  }

  // make the standup dialog available
  handler.addDialog(standupDialog);
  handler.addDialog(standupPrompt);

}