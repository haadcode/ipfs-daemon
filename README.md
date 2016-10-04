# ipfs-daemon

> Get a running IPFS daemon quickly in your Node.js code

This module provides a quick way to get an IPFS daemon up and running in your Node.js program. It will start a [go-ipfs] instance. Internally it uses [ipfsd-ctl](https://github.com/ipfs/js-ipfsd-ctl), [js-ipfs-api](https://github.com/ipfs/js-ipfs-api) and [go-ipfs-dep](https://github.com/haadcode/go-ipfs-dep).

## Install
```
npm install ipfs-daemon
```

## Usage
```javascript
    const IpfsDaemon = require('ipfs-daemon')
    IpfsDaemon(options).then((res) => {
      // res.ipfs - an IPFS API instance (js-ipfs and js-ipfs-api)
      // res.daemon - IPFS daemon (ipfsd-ctl/node)
      // res.Addresses - IPFS daemon's API, Gateway and Swarm addresses
    })
```

## Options
```javascript
{
  AppDataDir: './.tmp', // Local data diretory
  IpfsDataDir: process.env.IPFS_PATH, // Location of IPFS data repository
  Flags: ['--enable-pubsub-experiment'], // Flags to pass to IPFS daemon
  Addresses: { // IPFS Daemon addresses
    API: '/ip4/127.0.0.1/tcp/0',
    Swarm: ['/ip4/0.0.0.0/tcp/0'],
    Gateway: '/ip4/0.0.0.0/tcp/0'
  },
}
```
