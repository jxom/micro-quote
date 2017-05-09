# Micro Quote

> 🗣 Quotes of the internet.

A micro-service that returns a random tweet depending on the search term using [Twitter's Search API](https://dev.twitter.com/rest/reference/get/search/tweets).

Visit [https://quote.now.sh/](https://quote.now.sh/)

## Usage

### `GET /`

Display usage info

### `GET /:query`

Returns a contextual quote depending on the search query.

#### Optional query parameters

##### detailed

Display detailed result

Type: `boolean`

Default: `true`

Example: [https://quote.now.sh/bitcoin?detailed=true](https://quote.now.sh/bitcoin?detailed=true)

##### lang

Language of the result

Type: `string`

Default: `en`

Example: [https://quote.now.sh/bitcoin?lang=de](https://quote.now.sh/bitcoin?lang=de)

##### result_type

Type of search results

Type: `string`

Default: `popular`

Available: `recent`, `popular`, `mixed`

Example: [https://quote.now.sh/bitcoin?result_type=recent](https://quote.now.sh/bitcoin?result_type=recent)

## License

MIT © [Jake Moxey](https://jxom.io)
