# ipfs-daemon

> Get a running IPFS daemon quickly in your Node.js code

This module provides a quick way to get an [IPFS](https://ipfs.io) daemon up and running in your Node.js program. It will initialize and start a [go-ipfs](https://github.com/ipfs/go-ipfs) process that can then be called via various APIs. 

Internally ipfs-daemon uses [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl), [js-ipfs-api](https://github.com/ipfs/js-ipfs-api) and [go-ipfs-dep](https://github.com/haadcode/go-ipfs-dep) modules.

[![CircleCI](https://circleci.com/gh/haadcode/ipfs-daemon.svg?style=shield)](https://circleci.com/gh/haadcode/ipfs-daemon)

**Notes** 
- *Uses a custom version of go-ipfs binary called `floodsub-2`.*
- *Possibility to use with `js-ipfs` is on the TODO list.*

## Install
```
npm install ipfs-daemon
```

## Usage
```javascript
  const IpfsDaemon = require('ipfs-daemon')

  IpfsDaemon(options)
    .then((res) => {
      // res.ipfs - an IPFS API instance (js-ipfs and js-ipfs-api)
      // res.daemon - IPFS daemon (ipfsd-ctl/node)
      // res.Addresses - IPFS daemon's API, Gateway and Swarm addresses
    })
    .catch((err) => console.error(err))
```

See [js-ipfs-api API documentation](https://github.com/ipfs/js-ipfs-api#api) for using the IPFS API.

## Options

IpfsDaemon takes options as an argument where you can define various properties for the IPFS daemon. Default options are:

```javascript
{
  IpfsDataDir: process.env.IPFS_PATH, // Location of IPFS data repository
  LogDirectory: './', // Directory to write ipfs-daemon.log file for ipfs-daemon
  Flags: ['--enable-pubsub-experiment'], // Flags to pass to IPFS daemon
  Addresses: { // IPFS Daemon addresses
    API: '/ip4/127.0.0.1/tcp/5001',
    Swarm: ['/ip4/0.0.0.0/tcp/4001'],
    Gateway: '/ip4/0.0.0.0/tcp/8080'
  },
}
```

To turn on *DEBUG* logging, set `LOG` environment variable to `debug`, eg. `export LOG=debug`. Default LOG level is `ERROR`.
