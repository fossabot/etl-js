# ETL JS

Extract, Transform, and Load sharable and repeatable.

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Known Vulnerabilities][vulnerabilities-image]][vulnerabilities-url]


```js
const ETLJS = require('@lpezet/etl-js');
const Executor = require('@lpezet/etl-js/lib/executors').local;
const Commands = require('@lpezet/etl-js/lib/commands');

var template = {
	etl: [ step1 ],
	step1: {
		commands: {
			say_hello: {
				command: printf 'hello world!'
			}
		}
	}
};

var ETL = new ETLJS( new Executor() );
new Commands( ETL );

ETL.process( template );
```

# Installation

This is a [Node.js](https://nodejs.org/en/) module available through the [npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

Installation is done using the [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install @lpezet/etl-js
```

# Features

	* Template-based process (JSON, YAML) to express steps and activities as part of ETL
	* Extensible behavior via mods
	* Tags allowing more dynamic behavior through activities and mods.
	
# Concept

ETL-JS has been born from the need to script different activities as part of simple yet important extract, load, and transform processes.
The idea is to be able to share and easily repeat activities over and over as needed.

# Security

Commands, scripts and more can be executed as part of the Mods defined in the template. Therefore, you should make sure to use only the Mods you trust in your ETL Template.


# Getting Started

The quickest way to get started is to use ETL-JS via command line, with [`ETL-JS CLI`](https://github.com/lpezet/etl-js-cli).

  Install the executable:

```bash
$ npm install -g @lpezet/etl-js-cli
```

  Initialize process:
  
```bash
$ etl-js init
```

  Edit `settings.yml`, to specify the type of executor to use:
  
```yml
etl:
  executor: local1
  
executors:
  local1:
    type: local
```

  Create ETL template, hello.yml:

```yml
etl:
  - step1
  - step2
step1:
  commands:
    orion_pic:
      command: printf "orion-nebula-xlarge_web.jpg"
step2:
  files:
    /tmp/orion-nebula.jpg:
      source: https://www.nasa.gov/sites/default/files/thumbnails/image/{{ $.step1.commands.orion_pic.result }}
```

WARNING: This template will effectively download a JPG file. Open it as your own risk.

  Run template:

```bash
$ etl-js run hello.yaml
```

## Mods

Mods are features of the ETL template. They execute code, download files, import data into MySQL database, etc.
The idea is to leverage as much as possible of the existing and be as efficient as possible.
For more details, see the [Mods](Mods.md) page.

## Results

The ETL `process()` method returns a Promise. Upon success, the data **resolved** will contain the results of the process and each activity.
Given the following snippet:

```js
var template = {
	etl: [ 'step1', 'step2' ],
	step1: {
		commands: {
			"file_to_download": {
				command: "printf '[\"PIA08653/PIA08653~small.jpg\",\"PIA21073/PIA21073~small.jpg\"]'",
				result_as_json: true
			}
		}
	},
	step2: {
		files: {
			"/tmp/{{ $.step1.commands.file_to_download.result }}": {
				source: "https://images-assets.nasa.gov/image/{{ $.step1.commands.file_to_download.result }}"
			}
		}
	}
};
ETL.process( template ).then(function( pResults ) {
	console.log( util.inspect(pResults, false, null, true) );
});
```
, the result would be (some omission for brevity):

```json
{ etl: { exit: false },
  step1:
   { commands:
      { file_to_download:
         { error: null,
           result:
            [ 'PIA08653/PIA08653~small.jpg', 'PIA21073/PIA21073~small.jpg' ],
           message: null,
           exit: false,
           pass: true,
           _stdout:
            '["PIA08653/PIA08653~small.jpg","PIA21073/PIA21073~small.jpg"]',
           _stderr: '' } } },
  step2:
   { files:
      { '/tmp/PIA08653/PIA08653~small.jpg':
         { error: null,
           result:
            "--2019-03-03 11:28:23--  https://images-assets.nasa.gov/image/PIA08653/PIA08653~small.jpg\nResolving images-assets.nasa.gov... 52.84.216.98, 52.84.216.44, 52.84.216.36, ...\nConnecting to images-assets.nasa.gov|52.84.216.98|:443... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 21833 (21K) [image/jpeg]\nSaving to: '/tmp/PIA08653/PIA08653~small.jpg'\n\n     0K .......... .......... .                               100% 3.48M=0.006s\n\n2019-03-03 11:28:24 (3.48 MB/s) - '/tmp/PIA08653/PIA08653~small.jpg' saved [21833/21833]\n\n",
           message: null,
           exit: false,
           pass: true,
           _stdout:
            "--2019-03-03 11:28:23--  https://images-assets.nasa.gov/image/PIA08653/PIA08653~small.jpg\nResolving images-assets.nasa.gov... 52.84.216.98, 52.84.216.44, 52.84.216.36, ...\nConnecting to images-assets.nasa.gov|52.84.216.98|:443... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 21833 (21K) [image/jpeg]\nSaving to: '/tmp/PIA08653/PIA08653~small.jpg'\n\n     0K .......... .......... .                               100% 3.48M=0.006s\n\n2019-03-03 11:28:24 (3.48 MB/s) - '/tmp/PIA08653/PIA08653~small.jpg' saved [21833/21833]\n\n",
           _stderr: '' },
        '/tmp/PIA21073/PIA21073~small.jpg':
         { error: null,
           result:
            "--2019-03-03 11:28:24--  https://images-assets.nasa.gov/image/PIA21073/PIA21073~small.jpg\nResolving images-assets.nasa.gov...(...)",
           message: null,
           exit: false,
           pass: true,
           _stdout:
            "(...)",
           _stderr: '' } } } }
```


## License

  [MIT](LICENSE)

[npm-image]: https://badge.fury.io/js/%40lpezet%2Fetl-js.svg
[npm-url]: https://npmjs.com/package/@lpezet/etl-js
[travis-image]: https://travis-ci.org/lpezet/etl-js.svg?branch=master
[travis-url]: https://travis-ci.org/lpezet/etl-js
[coveralls-image]: https://coveralls.io/repos/github/lpezet/etl-js/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/lpezet/etl-js?branch=master
[appveyor-image]: https://ci.appveyor.com/api/projects/status/lr513vvn3is4u7nd?svg=true
[appveyor-url]: https://ci.appveyor.com/project/lpezet/etl-js
[vulnerabilities-image]: https://snyk.io/test/github/lpezet/etl-js/badge.svg
[vulnerabilities-url]: https://snyk.io/test/github/lpezet/etl-js
