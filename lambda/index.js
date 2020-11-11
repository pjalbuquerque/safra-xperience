/* eslint-disable no-use-before-define */
/* eslint-disable global-require */

const Alexa = require('ask-sdk-core');
const axios = require('axios');

const FULL_NAME_PERMISSION = "alexa::profile:name:read";
const EMAIL_PERMISSION = "alexa::profile:email:read";
const MOBILE_PERMISSION = "alexa::profile:mobile_number:read";

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
    headers,
    data: "grant_type=client_credentials&scope=urn:opc:resource:consumer::all"
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

const AccountToken = async (data) => {
    
    return {
        code: 1234,
        message: "Foi enviado um token para seu telefone celular. Por favor informe o token"
    }
//   return await axios.post('http://ec2-54-159-213-8.compute-1.amazonaws.com:1880/alexa', data)
//     .then(function (response) {
//       return response.data.payload
//     })
//     .catch(function (error) {
//       console.log(`ERROR: ${error.message}`);
//     });
}


const AccountInfo = async (conta) => {
    
  const authorization = await auth();
  const url = `https://af3tqle6wgdocsdirzlfrq7w5m.apigateway.sa-saopaulo-1.oci.customer-oci.com/fiap-sandbox/open-banking/v1/accounts/${conta}`
  const headers = {
    "authorization": `${authorization.token_type} ${authorization.access_token}`,
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
  }
  
  return await axios({
    method: 'get',
    url: url,
    headers
  })
  .then(function (response) {

    const account = response.data.Data.Account[0]

    const info = [
        `As informações da conta são:`,
        `Número da conta: ${account.AccountId}`,
        `Apelido da conta: ${account.Nickname}`,
        `Moeda da conta: ${account.Currency === 'BLR'? 'REAL': "ESTRANGEIRA"}`,
        `Dono da conta: ${account.Account.Name}`
    ]
    
    return info.join(" ")
  })
  .catch(function (error) {
    console.log(`ERROR: ${error.message}`);
  });
}

const News = async (data) => {
  const authorization = await auth();
  const url = 'https://af3tqle6wgdocsdirzlfrq7w5m.apigateway.sa-saopaulo-1.oci.customer-oci.com/fiap-sandbox/media/v1/youtube?fromData=2020-07-09&toData=2020-07-14&playlist=morningCalls&channel=safra'
  const headers = {
    "authorization": `${authorization.token_type} ${authorization.access_token}`,
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
  }
  
  return await axios({
    method: 'get',
    url: url,
    headers
  })
  .then(function (response) {
    const news = response.data.data.sort(function (a, b) {
      if (a.data > b.data) {
        return 1;
      }
      if (a.data < b.data) {
        return -1;
      }
      return 0;
    }).map(item => {

      return item.description
    });
    return news.join(" ")
  })
  .catch(function (error) {
    console.log(`ERROR: ${error.message}`);
  });
}

const NewAccount = async (data) => {

  // const body = {
  //   "Name": nome,
  //   "Email": email,
  //   "Phone": telefone
  // }

  const body = {
    "Name": "Robert Cecil Martin da Silva",
    "Email":"robert.cecil@unclebobcleancode.com",
    "Phone":"+5511922222222"
  }
  
  const authorization = await auth();
  const url = 'https://af3tqle6wgdocsdirzlfrq7w5m.apigateway.sa-saopaulo-1.oci.customer-oci.com/fiap-sandbox/accounts/v1/optin'
  const headers = {
    "authorization": `${authorization.token_type} ${authorization.access_token}`,
    "cache-control": "no-cache",
    "content-type": "application/json",
  }
  return await axios({
    method: 'post',
    url: url,
    headers,
    data: JSON.stringify(body)
  })
  .then(function (response) {
    if(response.status == 201){
      return [
        "Solicitação de cadastro efetuada com sucesso!",
        "Logo você irá receber nosso contato"
      ].join(" ")
    }
  })
  .catch(function (error) {
    console.log(`ERROR: ${error.message}`);
  });
}

const GetHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent 
      && (
          handlerInput.requestEnvelope.request.intent.name === 'AccountIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AccountInfoIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AccountBalanceIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AccountExtractIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AccountTransferIntent' ||
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
          
        const conta = handlerInput.requestEnvelope.request.intent.slots.conta.value
        
        if(conta){
            
            const token = await AccountToken();
            outputSpeech = token.message;
            
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            sessionAttributes.token = token.code;
            sessionAttributes.conta = conta;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        } else {
            
            const token = handlerInput.requestEnvelope.request.intent.slots.token.value
            
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            
            if(sessionAttributes.token == token){
                sessionAttributes.login = true;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                outputSpeech = "Login efetuado";
            } else {
                outputSpeech = "Token inválido tente novamente";
            }
        }
        
      }
      
      if(handlerInput.requestEnvelope.request.intent.name === 'AccountInfoIntent'){
          const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
          if(sessionAttributes.login){
            outputSpeech = AccountInfo(sessionAttributes.conta);
          } else {
            outputSpeech = "Você precisa efetuar o login em sua conta"
          }
      }
  
      if(handlerInput.requestEnvelope.request.intent.name === 'NewsIntent'){
        outputSpeech = await News();
      }
  
      if(handlerInput.requestEnvelope.request.intent.name === 'NewAccountIntent'){
        outputSpeech = await NewAccount();
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
