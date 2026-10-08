process.env._HANDLER = process.env._HANDLER || 'comment.handler';

const http = require('http');
const serverless = require('serverless-http');
const Waline = require('@waline/vercel');

const app = Waline({
  env: 'netlify',
  async postSave(comment) {},
});

const PREFIX = '/.netlify/functions/comment';
const wrapped = serverless(http.createServer(app));

module.exports.handler = async (event, context) => {
  // --- DEBUG MODE: report what we actually received ---
  try {
    if (event && typeof event.url === 'string' && typeof event.method === 'string' && typeof event.json === 'function') {
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'Request(v2-native)', url: event.url, method: event.method }),
      };
    }
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mode: 'v1-event',
        path: event && event.path,
        rawUrl: event && event.rawUrl,
        rawPath: event && event.rawPath,
        url: event && event.url,
        httpMethod: event && event.httpMethod,
        keys: event ? Object.keys(event) : null,
      }),
    };
  } catch (e) {
    return { statusCode: 200, body: 'DEBUG-ERR ' + e.message };
  }
  // eslint-disable-next-line no-unreachable
  return wrapped(event, context);
};