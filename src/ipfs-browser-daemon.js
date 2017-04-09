'use strict'

const IPFS = require('ipfs')
const IpfsDaemon = require('./ipfs-daemon.js')

const Logger = require('logplease')
const logger = Logger.create('ipfs-daemon', { useColors: false, showTimestamp: false })
Logger.setLogLevel('ERROR')

class IpfsBrowserDaemon extends IpfsDaemon {
  constructor(options) {
    // Initialize and start the daemon
    super(options)
    this._start()
  }

  _start() {
    return this._initDaemon()
      .then(() => this._startDaemon())
      .then(() => this.emit('ready'))
      .catch((e) => this.emit('error', e))
  }

  get GatewayAddress() {
    return '0.0.0.0:8080/ipfs/'//this._daemon.gatewayAddr ? this._daemon.gatewayAddr + '/ipfs/' : null
  }

  get APIAddress() {
    return this._options.Addresses.Swarm//(this.apiHost && this.apiPort) ? this.apiHost + ':' + this.apiPort : null
  }

  _initDaemon() {
    return new Promise((resolve, reject) => {
      const ipfsOptions = {
        repo: this._options.IpfsDataDir,
        EXPERIMENTAL: {
          pubsub: true
        }
      }

      this._daemon = new IPFS(ipfsOptions)
      this._daemon.init({ emptyRepo: true, bits: 2048 }, (err) => {
        if (err && err.message !== 'repo already exists') 
          return reject(err)

        this._daemon.config.get((err, config) => {
          if (err)
            return reject(err)

          if (this._options.SignalServer) {
            const address = this._options.SignalServer.split(':')
            const host = address[0] || '0.0.0.0'
            const port = address[1] || 9090
            const signalServer = address.length > 1
              // IP:port
              ? `/libp2p-webrtc-star/ip4/${host}/tcp/${port}/ws/ipfs/${config.Identity.PeerID}`
              // Domain
              : `/libp2p-webrtc-star/dns4/${this._options.SignalServer}/wss/ipfs/${config.Identity.PeerID}`

            this._options.Addresses.Swarm = [signalServer]
          }

          this._options = Object.assign(config, this._options)

          this._daemon.config.set('Bootstrap', this._options.Bootstrap, (err) => {
            if (err)
              return reject(err)

            this._daemon.config.set('Discovery', this._options.Discovery, (err) => {
              if (err)
                return reject(err)

              this._daemon.config.set('Addresses', this._options.Addresses, (err) => {
                if (err)
                  return reject(err)
                else
                  resolve()
              })
            })
          })
        })
      })
    })
  }

  _startDaemon() {
    return new Promise((resolve, reject) => {
      logger.debug('Starting IPFS daemon')

      this._daemon.id((err, id) => {
        if (err) {
          logger.error(err)
          return reject(err)
        }

        this._peerId = id.id

        // Assign the IPFS api to this
        let readyListeners = this.listeners('ready')
        let errorListeners = this.listeners('error')
        Object.assign(this, this._daemon)
        for (let l of readyListeners) {
          this.on('ready', l)
        }
        for (let l of errorListeners) {
          this.on('ready', l)
        }
        logger.debug('IPFS daemon started')
        resolve()
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
