'use strict'

module.exports = {
  // Location of IPFS repository
  IpfsDataDir: process.env.IPFS_PATH || './ipfs',
  // Location to write log files to
  LogDirectory: '/tmp',
  // Bind the IPFS daemon to a random port by default
  Addresses: {
    API: '/ip4/127.0.0.1/tcp/5001',
    Swarm: ['/ip4/0.0.0.0/tcp/4001'],
    Gateway: '/ip4/0.0.0.0/tcp/8080'
  },
  // WebRTC-Star Signal Server for js-ipfs
  SignalServer: null,
  // Flags to pass to the IPFS daemon
  Flags: ['--enable-pubsub-experiment'] // Enable Pubsub by default
}
