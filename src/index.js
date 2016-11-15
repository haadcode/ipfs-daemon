'use strict'

// const fs = require('fs')
// const mkdirp = require('mkdirp')
const path = require('path')
const assert = require('assert')
const EventEmitter = require('events').EventEmitter
const IPFS = require('ipfs')
const Logger = require('logplease')
const logger = Logger.create("ipfs-daemon")
Logger.setLogLevel('DEBUG')

const defaultOptions = require('./default-options')

class IpfsDaemon extends EventEmitter {
  constructor(options) {
    super()

    this.GatewayAddress = null
    this.APIAddress = null
    this.PeerId = null

    let opts = Object.assign({}, defaultOptions)
    Object.assign(opts, options)
    this._options = opts

    // Daemon that gets returned by ipfsd-ctl
    this._daemon = null

    // Make sure we have the app data directory
    // if (!fs.existsSync(this._options.IpfsDataDir))
    //   mkdirp.sync(this._options.IpfsDataDir)

    // Setup logfiles
    Logger.setLogfile(path.join(this._options.LogDirectory, '/ipfs-daemon.log'))

    // Handle shutdown signals
    process.on('SIGINT', () => this._handleShutdown)
    process.on('SIGTERM', () => this._handleShutdown)

    // Log errors
    process.on('uncaughtException', (error) => {
      // Skip 'ctrl-c' error and shutdown gracefully
      const match = String(error).match(/non-zero exit code 255/)
      if(match)
        this._handleShutdown()
      else
        logger.error(error)
    })

    // Initialize and start the daemon
    this._initDaemon()
      .then(() => this._startDaemon())
      .then(() => this.emit('ready'))
      .catch((e) => {
        this.emit('error', e)
      })
  }

  stop() {
    this._handleShutdown()
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

          this.PeerId = config.Identity.PeerID

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
      logger.debug("Starting IPFS daemon")
      this._daemon.goOnline((err) => {
        if (err)
          return reject(err)

        if (this._daemon.gatewayAddr) {
          this.GatewayAddress = this._daemon.gatewayAddr + '/ipfs/'
          logger.debug("Gateway listening at", this.GatewayAddress)          
        }

        // this.APIAddress = this._daemon.apiMultiaddr + ':' + this._daemon.apiMultiaddr
        Object.assign(this, this._daemon)
        logger.debug("IPFS daemon started")

        resolve()
      })
    })
  }

  // Handle shutdown gracefully
  _handleShutdown() {
    logger.debug("Shutting down...")
    
    if(this._daemon && this._daemon.isOnline())
      this._daemon.goOffline()

    this.GatewayAddress = null
    this.APIAddress = null
    this.PeerId = null
    this._options = null
    this._daemon = null

    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGTERM')
    process.removeAllListeners('uncaughtException')

    logger.debug("IPFS daemon stopped")
  } 
   
}

module.exports = IpfsDaemon
