const fs = require('fs');
const readline = require('readline');
const axios = require('axios');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function promptQuestion(query) {
  let answer;
  do {
    answer = await new Promise(resolve => rl.question(query, resolve));
  } while (!answer);
  return answer;
}

async function attemptLogin(attempts) {
  if (attempts === 0) {
    throw new Error('Your credentials failed. Please try again later.');
  }

  let sourceSystem = await promptQuestion('Enter sourceSystem: ');

  if (!sourceSystem.startsWith('http://') && !sourceSystem.startsWith('https://')) {
    const protocol = await promptQuestion('Enter 1 for https:// or 2 for http://: ');
    sourceSystem = (protocol === '1' ? 'https://' : 'http://') + sourceSystem;
  }
  const userName = await promptQuestion('Enter userName: ');
  const password = await promptQuestion('Enter password: ');

  const url = `${sourceSystem}/rest/2.0/auth/sessions`;
  const data = {
    username: userName,
    password: password
  };

  try {
    const response = await axios.post(url, data);

    if (response.status === 200) {
      const config = {
        sourceSystem,
        sourceREST: "rest/2.0/",
        sourceGRAPHQL: "graphql/knowledgeGraph/v1",
        userName,
        password
      };
      fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
      console.log('Configuration saved successfully.');
      rl.close();
      return config;
    } else {
      throw new Error('Connection unsuccessful.');
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('Authentication failed. Please try again.');
      return attemptLogin(attempts - 1);
    } else {
      throw error;
    }
  }
}

module.exports = attemptLogin;