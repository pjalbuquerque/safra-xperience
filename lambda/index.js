/* eslint-disable no-use-before-define */
/* eslint-disable global-require */

const Alexa = require('ask-sdk-core');
const axios = require('axios');

const GetRemoteDataHandler = {
  canHandle(handlerInput) {
      console.log("GetRemoteDataHandler", handlerInput)
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetRemoteDataIntent');
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';

    await getRemoteData('http://ec2-54-159-213-8.compute-1.amazonaws.com:1880/alexa', handlerInput)
      .then((response) => {
        const data = JSON.parse(response);
        outputSpeech = data.payload
        // outputSpeech = `There are currently ${data.people.length} astronauts in space. `;
        // for (let i = 0; i < data.people.length; i += 1) {
        //   if (i === 0) {
        //     // first record
        //     outputSpeech = `${outputSpeech}Their names are: ${data.people[i].name}, `;
        //   } else if (i === data.people.length - 1) {
        //     // last record
        //     outputSpeech = `${outputSpeech}and ${data.people[i].name}.`;
        //   } else {
        //     // middle record(s)
        //     outputSpeech = `${outputSpeech + data.people[i].name}, `;
        //   }
        // }
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
      console.log("HelpIntentHandler", handlerInput)
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
      console.log("CancelAndStopIntentHandler", handlerInput)
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
      console.log("SessionEndedRequestHandler", handlerInput)
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const getRemoteData = (url, handlerInput) => new Promise((resolve, reject) => {
  axios.post(url, handlerInput)
  .then(function (response) {
    resolve(response.join(''))
  })
  .catch(function (error) {
    reject(error)
  });

});

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetRemoteDataHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();