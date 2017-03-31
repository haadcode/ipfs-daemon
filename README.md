# ipfs-daemon

[![npm version](https://badge.fury.io/js/ipfs-daemon.svg)](https://badge.fury.io/js/ipfs-daemon)
[![CircleCI](https://circleci.com/gh/haadcode/ipfs-daemon.svg?style=shield)](https://circleci.com/gh/haadcode/ipfs-daemon)

> Get a running IPFS daemon quickly with Javascript

This module provides a quick way to get an [IPFS](https://ipfs.io) daemon up and running in your Javascript program. It works with both **Node.js** and the **browsers** and can be used to start a [js-ipfs](https://github.com/ipfs/js-ipfs) instance or a [go-ipfs](https://github.com/ipfs/go-ipfs) daemon. 

***NOTE!*** *This module will be deprecated in the near future. [js-ipfs](https://github.com/ipfs/js-ipfs) has now implemented a new API for creating an instance which is similar to the API in `ipfs-daemon`. Please also note that module uses js-ipfs@0.22.0 which is older than the latest version.*

***The recommended way to create an IPFS instance for Node.js and Browsers is to use [js-ipfs](https://github.com/ipfs/js-ipfs#ipfs-core-use-ipfs-as-a-module).***

This modules uses:
- [js-ipfs](https://github.com/ipfs/js-ipfs)
- [js-ipfs-api](https://github.com/ipfs/js-ipfs-api)
- [js-ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Examples](#examples)
- [API](#api)
- [Development](#development)
- [Background](#background)
- [Contributing](#contributing)
- [License](#license)

## Install
```
npm install ipfs-daemon
```

## Usage

```javascript
  const IPFS = require('ipfs-daemon')
  const ipfs = new IPFS()

  ipfs.on('ready', () => {
    // IPFS is now ready to be used
    // eg. ipfs.files.add(..)
  })

  ipfs.on('error', (e) => console.error(err))
```

See [API documentation](#api) for details.

## Examples

You can find a simple **Node.js** example in [examples/native.js](https://github.com/haadcode/ipfs-daemon/blob/master/examples/native.js). You can run it with:

```
node examples/native.js
```

You can find a **browser** example in [examples/browser/index.html](https://github.com/haadcode/ipfs-daemon/blob/master/examples/browser/index.html). You can run it by opening the file in a browser. 

*Note! Browser example currently only works in Chrome.*

## API

In addition to the API documented here, `ipfs-daemon` makes the IPFS API available at the top level of the instantiated object. 

When used in Node.js, the available functionality is described in [js-ipfs-api](https://github.com/ipfs/js-ipfs-api#api) documentation. 

When used in the browser, the available functionality is described in [js-ipfs](https://github.com/ipfs/js-ipfs#api) documentation.

- [Getting Started](#getting-started)
- [Constructor](#constructor)
  - [new IpfsDaemon](#new-ipfsdaemonoptions)
- [Methods](#methods)
  - [stop](#stop)
- [Properties](#properties)
  - [PeerId](#peerid)
  - [GatewayAddress](#gatewayaddress)
  - [APIAddress](#apiaddress)
- [Events](#events)
  - [ready](#ready)
  - [error](#error)

### Getting Started

In order to use an IPFS daemon, you first need to require the module in your project:

```javascript
const IPFS = require('ipfs-daemon')
```

And then instantiate an `IPFS` object. You can pass options to the constructor, see [options](#new-ipfsdaemonoptions) for details.

```javascript
const ipfs = new IPFS(options)
```

Then, before you can use it, you'll have to wait for the `ready` event to be emitted:

```javascript
ipfs.on('ready', () => {
  // IPFS API is now ready to be used
  // eg. ipfs.files.add(..)
})

ipfs.on('error', (e) => console.log(e))
```

### Constructor

#### new IpfsDaemon([options])

```javascript
const ipfs = new IPFS(options)
```

IpfsDaemon takes `options` as an *optional* argument where you can define various properties for the IPFS daemon. Default options are:

```javascript
{
  IpfsDataDir: process.env.IPFS_PATH, // Location of IPFS data repository
  LogDirectory: '/tmp', // Directory to write ipfs-daemon.log file for ipfs-daemon
  Flags: ['--enable-pubsub-experiment'], // Flags to pass to IPFS daemon
  Addresses: { // IPFS Daemon addresses
    API: '/ip4/127.0.0.1/tcp/5001',
    Swarm: ['/ip4/0.0.0.0/tcp/4001'],
    Gateway: '/ip4/0.0.0.0/tcp/8080'
  },
  API: { // API config for IPFS daemon
    HTTPHeaders: {
      "Access-Control-Allow-Origin": ['*'], // Origins from which to allow http requests
      "Access-Control-Allow-Methods": [], // "PUT", "GET", "POST", "DELETE", etc.
      "Access-Control-Allow-Credentials": [] // "true" || "false"
    } 
  },
  SignalServer: null // WebRTC sig-star server, browser only, eg. '127.0.0.1'
}
```

### Methods

#### stop()

Stops and shuts down the IPFS daemon

```javascript
ipfs.stop()
```

### Properties

#### PeerId

The Peer ID of the IPFS daemon.

```javascript
ipfs.PeerId // 'QmSUs7xtkm4yTZpashfjJZvptNZAAzahJjDbRcnGL43BzH'
```

#### GatewayAddress

The address to which the IPFS HTTP Gateway of go-ipfs is bound to.

```javascript
ipfs.GatewayAddress // 'localhost:8080/ipfs/'
```

#### APIAddress

The address to which the IPFS HTTP API of go-ipfs is bound to.

```javascript
ipfs.APIAddress // '127.0.0.1:5001'
```

### Events

`Ipfs` inherits from [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) and it emits the following events:

#### ready

Emitted when IPFS has started and is ready to be used.

```javascript
ipfs.on('ready', () => {
  // IPFS is now ready to be used
})
```

#### error

Emitted when an error occurs in IPFS.

```javascript
ipfs.on('error', (e) => console.error(err))
```

## Development

#### Setup
```
git clone https://github.com/haadcode/ipfs-daemon.git
cd ipfs-daemon/
npm install
```

#### Run Tests
```
npm test
```

#### Build
```
npm run build
```

## Background

Currently existing modules for IPFS require multiple steps and knowledge how to get an IPFS daemon started. Furthermore, some of the required steps are not documented, making it hard to get started with Javacript and IPFS. This module was written to provide an easy way to get IPFS up and running.

In Node.js, `ipfs-daemon` will initialize and start a detached [go-ipfs](https://github.com/ipfs/go-ipfs) process that can then be called via the [API](#api). Internally the Node.js version uses [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl), [js-ipfs-api](https://github.com/ipfs/js-ipfs-api) and [go-ipfs-dep](https://github.com/haadcode/go-ipfs-dep) modules. Please note that `ipfs-daemon` currently uses a custom version of go-ipfs binary called [floodsub-2](https://dist.ipfs.io/go-ipfs/floodsub-2) which is required to make sure Pubsub API works.

In the browsers, `ipfs-daemon` will start a [js-ipfs](https://github.com/ipfs/js-ipfs) instance which can be used via the [API](#api).

## Contributing

[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

I would be happy to accept PRs! If something is not working, opening a [new issue](https://github.com/haadcode/ipfs-daemon/issues/new) would be highly appreciated.

You can reach me on IRC #ipfs on Freenode, or by opening an [issue](https://github.com/haadcode/ipfs-daemon/issues).

## License

[MIT](LICENSE) ©️ 2016 Haadcode
