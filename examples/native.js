'use strict'

console.log('Starting IPFS daemon...')

const IPFS = require('../src/ipfs-native-daemon')
const ipfs = new IPFS()

ipfs.on('error', (e) => console.error(e))
ipfs.on('ready', () => {
  console.log('Hello, Interplanetary Friend')
  console.log(ipfs.PeerId)
  console.log(ipfs.GatewayAddress)
  console.log(ipfs.APIAddress)
  ipfs.stop()
})
