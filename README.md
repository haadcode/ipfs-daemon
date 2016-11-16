# ipfs-daemon

[![npm version](https://badge.fury.io/js/ipfs-daemon.svg)](https://badge.fury.io/js/ipfs-daemon)
[![CircleCI](https://circleci.com/gh/haadcode/ipfs-daemon.svg?style=shield)](https://circleci.com/gh/haadcode/ipfs-daemon)

> Get a running IPFS daemon quickly in your Node.js code

This module provides a quick way to get an [IPFS](https://ipfs.io) daemon up and running in your Node.js program. It will initialize and start a [go-ipfs](https://github.com/ipfs/go-ipfs) process that can then be called via various APIs. 

Internally ipfs-daemon uses [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl), [js-ipfs-api](https://github.com/ipfs/js-ipfs-api) and [go-ipfs-dep](https://github.com/haadcode/go-ipfs-dep) modules.

*Please note that `ipfs-daemon` currently uses a custom version of go-ipfs binary called [floodsub-2](https://dist.ipfs.io/go-ipfs/floodsub-2) which is required to make sure Pubsub API works.*

**Notes** 
- *Possibility to use with `js-ipfs` is on the TODO list.*

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - [Constructor](#constructor)
    - [new IpfsDaemon](#new-ipfsdaemonoptions)
  - [Methods](#methods)
    - [stop](#stop)
  - [Properties](#properties)
    - [GatewayAddress](#gatewayaddress)
    - [APIAddress](#apiaddress)
  - [Events](#events)
    - [ready](#ready)
    - [error](#error)
- [Logging](#logging)

## Install
```
npm install ipfs-daemon
```

## Usage

```javascript
  const IPFS = require('ipfs-daemon')
  const ipfs = new IPFS(options)

  ipfs.on('ready', () => {
    // IPFS is now ready to be used
    // eg. ipfs.files.add(..)
  })

  ipfs.on('error', (e) => console.error(err))
```

See [js-ipfs-api API documentation](https://github.com/ipfs/js-ipfs-api#api) for using the IPFS API.

## API

In order to use an IPFS daemon, you first need to require the module in your project:

```javascript
const IPFS = require('ipfs-daemon')
```

And then instantiate an `IPFS` object. You can pass options to the constructor, see [options](#options) for details.

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

#### new IpfsDaemon(options)

```javascript
const ipfs = new IPFS(options)
```

IpfsDaemon takes options as an argument where you can define various properties for the IPFS daemon. Default options are:

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

## Logging

To turn on *DEBUG* logging, set `LOG` environment variable to `debug`, eg. `export LOG=debug`. Default LOG level is `ERROR`.
