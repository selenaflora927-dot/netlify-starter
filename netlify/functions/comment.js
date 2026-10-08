// Netlify Functions v2 runtime compatible:
// 1. Waline's netlify adapter derives its route prefix from process.env._HANDLER,
//    which the v2 runtime does not inject any more - set it ourselves.
// 2. Depending on the runtime, event.path may arrive as the full URL path
//    ("/.netlify/functions/comment/api/...") or already stripped ("/api/...").
//    Normalize everything to the full-prefixed form Waline expects.
process.env._HANDLER = process.env._HANDLER || 'comment.handler';

const http = require('http');
const serverless = require('serverless-http');
const Waline = require('@waline/vercel');

const app = Waline({
  env: 'netlify',
  async postSave(comment) {
    // do what ever you want after save comment
  },
});

const PREFIX = '/.netlify/functions/comment';
const wrapped = serverless(http.createServer(app));

module.exports.handler = async (event, context) => {
  let path = event && typeof event.path === 'string' ? event.path : '/';
  if (!path.startsWith(PREFIX)) {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    event = Object.assign({}, event, {
      path: PREFIX + path,
      rawUrl: undefined,
      rawQueryString: undefined,
    });
  }
  return wrapped(event, context);
};
