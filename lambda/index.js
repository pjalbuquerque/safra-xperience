/* eslint-disable no-use-before-define */
/* eslint-disable global-require */

const Alexa = require('ask-sdk-core');
const axios = require('axios');

const auth = async () => {
  
  const url = "https://idcs-902a944ff6854c5fbe94750e48d66be5.identity.oraclecloud.com/oauth2/v1/token";
  const headers = {
    "authorization": "Basic OThiMmEwZDY0MWQ0NDFmZDhmMWQyOTdlNDg3NjFmMzk6ZDczMjU5YWYtYzJhZC00MTMzLWI0NjEtNDYyN2IwN2VlMDZj",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
    "postman-token": "280d6ac2-0e1c-d7ed-fc20-85de145f3d1c"
  }

  return await axios({
    method: 'post',
    url: url,
    headers
  })
  .then(function (response) {
    return {
      access_token: response.data.access_token,
      token_type: response.data.token_type
    }
  })
  .catch(function (error) {
    console.log(`ERROR: ${error.message}`);
  });

}

const InitialIntent = async (data) => {

  return [
    'O que você gostaria de fazer?',
    '- Acessar conta',
    '- Noticias da manha',
    '- Solicitar abertura de conta'
  ].join(" ")
}

const AccountIntent = async (data) => {
  return await axios.post('http://ec2-54-159-213-8.compute-1.amazonaws.com:1880/alexa', data)
    .then(function (response) {
      return response.data.payload
    })
    .catch(function (error) {
      console.log(`ERROR: ${error.message}`);
    });
}

const NewsIntent = async (data) => {
  return await axios.post('http://ec2-54-159-213-8.compute-1.amazonaws.com:1880/alexa', data)
    .then(function (response) {
      return response.data.payload
    })
    .catch(function (error) {
      console.log(`ERROR: ${error.message}`);
    });
}

const NewAccountIntent = async (data) => {
  return await axios.post('http://ec2-54-159-213-8.compute-1.amazonaws.com:1880/alexa', data)
    .then(function (response) {
      return response.data.payload
    })
    .catch(function (error) {
      console.log(`ERROR: ${error.message}`);
    });
}

const InitialIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  async handle(handlerInput) {

    let outputSpeech = InitialIntent();

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
};
const AccountIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' && 
    handlerInput.requestEnvelope.request.intent.name === 'AccountIntent'
  },
  async handle(handlerInput) {

    let outputSpeech = AccountIntent();

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
}; 
const NewsIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' && 
    handlerInput.requestEnvelope.request.intent.name === 'NewsIntent'
  },
  async handle(handlerInput) {

    let outputSpeech = NewsIntent();

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
};
const NewAccountIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' && 
    handlerInput.requestEnvelope.request.intent.name === 'NewAccountIntent'
  },
  async handle(handlerInput) {

    let outputSpeech = NewAccountIntent();

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
};
const GetHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (
          handlerInput.requestEnvelope.request.intent.name === 'AccountIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'NewsIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'NewAccountIntent'
        )
      );
  },
  async handle(handlerInput) {

    let outputSpeech = ""

    if(handlerInput.requestEnvelope.request.type === 'LaunchRequest'){
      outputSpeech = InitialIntent();
    }

    if(handlerInput.requestEnvelope.request.intent.name === 'AccountIntent'){
      outputSpeech = AccountIntent();
    }

    if(handlerInput.requestEnvelope.request.intent.name === 'NewsIntent'){
      outputSpeech = NewsIntent();
    }

    if(handlerInput.requestEnvelope.request.intent.name === 'NewAccountIntent'){
      outputSpeech = NewAccountIntent();
    }

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
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

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    InitialIntent,
    AccountIntent,
    NewsIntent,
    NewAccountIntent,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();