// Netlify Functions v2 runtime compatibility for Waline:
// - Set _HANDLER ourselves so Waline's netlify adapter computes the right
//   public prefix (the v2 runtime no longer injects it).
// - The runtime hands us the FULL path (e.g. "/.netlify/functions/comment/api/...")
//   but Waline only reliably matches its plain "/api/..." routes, so strip
//   the function prefix before handing the event to serverless-http.
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
  if (path.startsWith(PREFIX)) {
    path = path.slice(PREFIX.length) || '/';
  }
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const normalized = Object.assign({}, event, {
    path,
    rawUrl: undefined,
    rawQuery: undefined,
    rawQueryString: undefined,
  });
  return wrapped(normalized, context);
};