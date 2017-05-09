const { send } = require('micro');
const microAPI = require('micro-api');
const microCORS = require('micro-cors')();
const request = require('request-promise').defaults({ encoding: null });
const queryString = require('query-string');

const AUTH_TOKEN_URL = 'https://api.twitter.com/oauth2/token';
const SEARCH_URL = 'https://api.twitter.com/1.1/search/tweets.json';
const DEFAULT_QUERY_PARAMS = {
  lang: 'en',
  result_type: 'popular',
  count: 15
}

const getAuthToken = async () => {
  const base64EncodedToken = new Buffer(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`).toString('base64');
  const authTokenRes = await request({
    method: 'post',
    uri: AUTH_TOKEN_URL,
    headers: {
      Authorization: `Basic ${base64EncodedToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials',
    json: true
  });
  return authTokenRes.access_token;
}

const getTweets = async ({ q, queryStrings }, authToken) =>
  request({
    uri: SEARCH_URL,
    qs: Object.assign({}, DEFAULT_QUERY_PARAMS, { q }, queryStrings),
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    json: true
  });

const handleNoSearchQuery = ({ res }) => {
  return `\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="HandheldFriendly" content="true" />
    <title>Micro Quote</title>
  </head>
  <body>
    <h1>Micro Quote</h1>
    <i>Quotes of the internet.</i>
    <p style="margin-top: 20px;">
      Find a random quote (from twitter) by entering your query in the URL!<br/>
      E.g. <a href="https://quote.now.sh/bitcoin">https://quote.now.sh/bitcoin</a>
    </p>
    <h3 style="margin-top: 40px;">Optional query parameters</h3>
    <h4 style="margin-bottom: 0px;">detailed</h4>
    <p style="margin-top: 0px;">
      <i>Display detailed result</i><br/><br/>
      Type: boolean<br/>
      Default: true<br/>
      Example: <a href="https://quote.now.sh/bitcoin?detailed=true">https://quote.now.sh/bitcoin?detailed=true</a>
    </p>
    <h4 style="margin-bottom: 0px;">lang</h4>
    <p style="margin-top: 0px;">
      <i>Display detailed result</i><br/><br/>
      Type: string<br/>
      Default: en<br/>
      Example: <a href="https://quote.now.sh/bitcoin?lang=de">https://quote.now.sh/bitcoin?lang=de</a>
    </p>
    <h4 style="margin-bottom: 0px;">result_type</h4>
    <p style="margin-top: 0px;">
      <i>Type of search results</i><br/><br/>
      Type: string<br/>
      Default: popular<br/>
      Example: <a href="https://quote.now.sh/bitcoin?search_type=recent">https://quote.now.sh/bitcoin?search_type=recent</a>
    </p>
  </body>
</html>
  `;
}

const handleGetRandomPhrase = async ({ params: { phrase }, res }) => {
  const q = phrase.split('?')[0];
  const queryStrings = queryString.parse(phrase.split('?')[1]);
  let count = DEFAULT_QUERY_PARAMS.count;
  try {
    const authToken = await getAuthToken();
    const searchResp = await getTweets({ q, queryStrings }, authToken);

    if (searchResp.statuses.length < DEFAULT_QUERY_PARAMS.count) {
      count = searchResp.statuses.length;
    }

    const status = searchResp.statuses[Math.floor(Math.random() * count)];

    if (!status) {
      return {};
    }
    if (queryStrings.detailed) {
      return status;
    }
    return { text: status.text };
  } catch (err) {
    return err;
  }
}

const api = microAPI([
  {
    method: 'get',
    path: '/',
    handler: handleNoSearchQuery,
  },
  {
    method: 'get',
    path: '/:phrase',
    handler: handleGetRandomPhrase
  }
]);

module.exports = microCORS(api);
