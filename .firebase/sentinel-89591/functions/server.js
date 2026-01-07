const { onRequest } = require('firebase-functions/v2/https');
  const server = import('firebase-frameworks');
  exports.ssrsentinel89591 = onRequest({"region":"southamerica-east1"}, (req, res) => server.then(it => it.handle(req, res)));
  