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

const Initial = (data) => {

  return [
    'O que você gostaria de fazer?',
    '- Acessar conta',
    '- Notícias da manhã',
    '- Solicitar abertura de conta'
  ].join(" ")
}

const Account = async (data) => {
  return await axios.post('http://ec2-54-159-213-8.compute-1.amazonaws.com:1880/alexa', data)
    .then(function (response) {
      return response.data.payload
    })
    .catch(function (error) {
      console.log(`ERROR: ${error.message}`);
    });
}

const News = async (data) => {
  const authorization = auth();
  const url = 'https://af3tqle6wgdocsdirzlfrq7w5m.apigateway.sa-saopaulo-1.oci.customer-oci.com/fiap-sandbox/media/v1/youtube?fromData=2020-07-09&toData=2020-07-14&playlist=morningCalls&channel=safra'
  const headers = {
    "authorization": `${authorization.access_token} ${authorization.token_type}`,
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
  }

  return await axios({
    method: 'get',
    url: url,
    headers
  })
  .then(function (response) {
    return response.data
  })
  .catch(function (error) {
    console.log(`ERROR: ${error.message}`);
  });
}

const NewAccount = async (data) => {
  return await axios.post('http://ec2-54-159-213-8.compute-1.amazonaws.com:1880/alexa', data)
    .then(function (response) {
      return response.data.payload
    })
    .catch(function (error) {
      console.log(`ERROR: ${error.message}`);
    });
}

const GetHandler = {
  canHandle(handlerInput) {
    console.log(JSON.stringify(handlerInput))
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent 
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
      outputSpeech = Initial();
    }

    if(handlerInput.requestEnvelope.request.intent){
      if(handlerInput.requestEnvelope.request.intent.name === 'AccountIntent'){
        outputSpeech = Account();
      }
  
      if(handlerInput.requestEnvelope.request.intent.name === 'NewsIntent'){
        outputSpeech = News();
      }
  
      if(handlerInput.requestEnvelope.request.intent.name === 'NewAccountIntent'){
        outputSpeech = NewAccount();
      }
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
    GetHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();