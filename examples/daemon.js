'use strict'

const IpfsDaemon = require('../src/ipfs-daemon')

const ipfs = new IpfsDaemon()
ipfs.on('error', (e) => console.error(e))
ipfs.on('ready', () => {
    console.log("hello")
    console.log(ipfs.GatewayAddress)
    console.log(ipfs.APIAddress)
    ipfs.stop()
})
