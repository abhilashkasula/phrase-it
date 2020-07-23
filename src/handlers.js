const https = require('https');

const request = (options) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let json = '';
      res.on('data', (chunk) => (json += chunk));
      res.on('end', () => {
        const data = JSON.parse(json);
        if (data.error) {
          return reject(data.error);
        }
        resolve(data);
      });
    });
    req.end();
  });
};

const getTokenOptions = (query) => ({
  host: 'github.com',
  path: `/login/oauth/access_token?${query}`,
  method: 'POST',
  headers: {
    Accept: 'application/json',
  },
});

const getDetailsOptions = (token) => ({
  host: 'api.github.com',
  path: '/user',
  method: 'GET',
  headers: {
    'User-Agent': 'curl/7.64.1',
    Authorization: `token ${token}`,
  },
});

const requestUserDetails = (req, res, token) => {
  const detailsOptions = getDetailsOptions(token);
  request(detailsOptions)
    .then((data) => {
      res.json(data);
    })
    .catch(() => res.status(404).send('Err'));
};

const getUserToken = function (req, res) {
  const {code} = req.query;
  const query = `client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_SECRET}&code=${code}`;
  const tokenOptions = getTokenOptions(query);
  request(tokenOptions)
    .then(({access_token}) => requestUserDetails(req, res, access_token))
    .catch(() => res.status(404).send('Err'));
};

module.exports = {getUserToken};
