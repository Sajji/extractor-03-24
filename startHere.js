const attemptLogin = require('./1-createConfig.js');

async function start() {
  try {
    const config = await attemptLogin(3);
    // You can call another async function here
    // await anotherAsyncFunction(config);
  } catch (error) {
    console.error('Error:', error);
  }
}

start();