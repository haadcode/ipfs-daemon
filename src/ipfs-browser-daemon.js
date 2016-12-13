'use strict'

const IPFS = require('ipfs')
const IpfsDaemon = require('./ipfs-daemon.js')

const Logger = require('logplease')
const logger = Logger.create('ipfs-daemon', { useColors: false, showTimestamp: false })
Logger.setLogLevel('NONE')

class IpfsBrowserDaemon extends IpfsDaemon {
  constructor(options) {
    // Initialize and start the daemon
    super(options)
    super._start()
  }

  get GatewayAddress() {
    return '0.0.0.0:8080/ipfs/'//this._daemon.gatewayAddr ? this._daemon.gatewayAddr + '/ipfs/' : null
  }

  get APIAddress() {
    return this._options.Addresses.Swarm//(this.apiHost && this.apiPort) ? this.apiHost + ':' + this.apiPort : null
  }

  _initDaemon() {
    return new Promise((resolve, reject) => {
      this._daemon = new IPFS(this._options.IpfsDataDir)
      this._daemon.init({ emptyRepo: true, bits: 2048 }, (err) => {
        if (err && err.message !== 'repo already exists') 
          return reject(err)

        this._daemon.config.get((err, config) => {
          if (err)
            return reject(err)

          if (this._options.SignalServer) {
             // Add at least one libp2p-webrtc-star address. Without an address like this
             // the libp2p-webrtc-star transport won't be installed, and the resulting
             // node won't be able to dial out to libp2p-webrtc-star addresses.
            const signalServer = ('/libp2p-webrtc-star/ip4/' + this._options.SignalServer + '/tcp/9090/ws/ipfs/' + config.Identity.PeerID)
            this._options.Addresses.Swarm = [signalServer]            
          }

          this._daemon.config.set('Addresses', this._options.Addresses, (err) => {
            if (err)
              return reject(err)

            this._daemon.load((err) => {
              if (err)
                reject(err)
              else
                resolve()            
            })
          })
        })
      })
    })
  }

  _startDaemon() {
    return new Promise((resolve, reject) => {
      logger.debug('Starting IPFS daemon')
      this._daemon.goOnline((err) => {
        if (err)
          return reject(err)

        this._daemon.id((err, id) => {
          this._peerId = id.id
          // Assign the IPFS api to this
          Object.assign(this, this._daemon)
          logger.debug('IPFS daemon started')
          resolve()
        })
      })
    })
  }

  // Handle shutdown gracefully
  _handleShutdown() {
    if (this._daemon && this._daemon.isOnline())
      this._daemon.goOffline()

    super._handleShutdown()
  }   
}

IpfsBrowserDaemon.Name = 'js-ipfs-browser'
module.exports = IpfsBrowserDaemon
