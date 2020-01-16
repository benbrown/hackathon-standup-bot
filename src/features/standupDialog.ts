import { BotFrameworkAdapter, MessageFactory, TurnContext } from 'botbuilder';
import { WaterfallDialog, TextPrompt  } from 'botbuilder-dialogs';
import * as Debug from 'debug'
import { Handler } from '../handler';

const debug = Debug('bot:dialog:standup');
const { ActivityFactory, TemplateEngine } = require('botbuilder-lg');

const path = require('path');

let lgEngine = new TemplateEngine().addFile(path.join(__dirname, '../../resources/standupPrompts.lg'));

export default (handler: Handler) => {

  const standupPrompt = new TextPrompt('TEXTPROMPT');

  const standupDialog = new WaterfallDialog('STANDUP', [
    async(step) => {
      let user = step.options['user'].name;
      let teamName = step.options['team'];
      let channelName = step.options['channel'];

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
        channelId: step.options['channelId'],
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

      let currentStandup = await handler.db.getStandupForChannel(results.channelId);

      // add the user id to the list of users who have already responded to this.
      currentStandup.respondees.push(results.user.id);

      // update this record with this user's answers
      for (let x = 0; x < results.answers.length; x++) {
        currentStandup.questions[x].participants.push({
          id: results.user.id,
          name: results.user.name,
          response: results.answers[x],
        });
      }
      
      await handler.db.saveStandup(currentStandup);

      // await context.sendActivity(`${ results.user.name } finished a stand-up: \`\`\`${ JSON.stringify(results.answers, null, 2) }\`\`\``);
      await context.sendActivity(`${ results.user.name } finished the stand-up.`);

      // update the original card with new stuff
      let activity = ActivityFactory.createActivity(lgEngine.evaluateTemplate("ActiveMeetingCard", currentStandup))
      activity.id = currentStandup.original_card;

      // await context.sendActivity(activity);

      debug('CARD TO UPDATE', activity);

      await context.updateActivity(activity);
    });
  }

  // make the standup dialog available
  handler.addDialog(standupDialog);
  handler.addDialog(standupPrompt);

}