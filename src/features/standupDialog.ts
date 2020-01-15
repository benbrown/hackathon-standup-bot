import { BotFrameworkAdapter } from 'botbuilder';
import { WaterfallDialog, TextPrompt } from 'botbuilder-dialogs';
import * as Debug from 'debug'
import { Handler } from '../handler';

const debug = Debug('bot:dialog:standup');
const { TemplateEngine } = require('botbuilder-lg');
const path = require('path');

let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));

export default (handler: Handler) => {

  const standupPrompt = new TextPrompt('TEXTPROMPT');

  const standupDialog = new WaterfallDialog('STANDUP', [
    async(step) => {
      let user = step.options['user'].name;
      let teamName = step.options['team'].name;
      let channelName = step.options['channel'].name;

      step.values['answers'] = [];

      await step.context.sendActivity(lgEngine.evaluateTemplate("BeginStandup", { user, teamName, channelName }));     
      return await step.next();
    }, 
    async(step) => {
      return await step.prompt('TEXTPROMPT', lgEngine.evaluateTemplate("WorkingOnPastPrompt"));
    }, 
    async(step) => {
      step.values['answers'].push(step.result);
      return await step.prompt('TEXTPROMPT', lgEngine.evaluateTemplate("WorkingOnNextPrompt"));
    }, 
    async(step) => {
      step.values['answers'].push(step.result);
      return await step.prompt('TEXTPROMPT', lgEngine.evaluateTemplate("BlockerPrompt"));
    },  
    async(step) => {
      step.values['answers'].push(step.result);

      const results = {
        answers: step.values['answers'],
        originalContext: step.options['originalContext'],
        user: step.options['user'],
      };

      debug('Final results', results);

      await step.context.sendActivity(lgEngine.evaluateTemplate("ThankUserForCompletion"));

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