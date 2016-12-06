'use strict'

const defaultOptions = require('./default-options')
const path = require('path')
const EventEmitter = require('events').EventEmitter
const Logger = require('logplease')
const logger = Logger.create('ipfs-daemon', { useColors: false })
Logger.setLogLevel('NONE')

class IpfsDaemon extends EventEmitter {
  constructor(options) {
    super()

    let opts = Object.assign({}, defaultOptions)
    Object.assign(opts, options)

    this._options = opts
    this._daemon = null
    this._peerId = null
    // this._name = 'ipfs-daemon'

    Logger.setLogfile(path.join(this._options.LogDirectory, '/ipfs-daemon.log'))

    // // Handle shutdown signals
    // process.on('SIGINT', () => this._handleShutdown)
    // process.on('SIGTERM', () => this._handleShutdown)

    // // Log errors
    // process.on('uncaughtException', (error) => {
    //   // Skip 'ctrl-c' error and shutdown gracefully
    //   const match = String(error).match(/non-zero exit code 255/)
    //   if(match)
    //     this._handleShutdown()
    //   else
    //     logger.error(error)
    // })
  }

  // get Name() {
  //   return this._name
  // }

  get Options() {
    return this._options
  }

  get PeerId() {
    return this._peerId
  }

  get Addresses() {
    return {
      Gateway: this._daemon.gatewayAddr ? this._daemon.gatewayAddr + '/ipfs/' : null,
      API: (this.apiHost && this.apiPort) ? this.apiHost + ':' + this.apiPort : null
    }
  }

  get GatewayAddress() {
    return this._daemon.gatewayAddr ? this._daemon.gatewayAddr + '/ipfs/' : null
  }

  get APIAddress() {
    return (this.apiHost && this.apiPort) ? this.apiHost + ':' + this.apiPort : null
  }

  stop() {
    this._handleShutdown()
  }

  _start() {
    this._initDaemon()
      .then(() => this._startDaemon())
      .then(() => this.emit('ready'))
      .catch((e) => this.emit('error', e))
  }

  _initDaemon() {
    throw new Error('_initDaemon() not implemented')
  }

  _startDaemon() {
    throw new Error('_startDaemon() not implemented')
  }

  _handleShutdown() {
    logger.debug('Shutting down...')
    
    this._options = null
    this._daemon = null
    this._peerId = null

    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGTERM')
    process.removeAllListeners('uncaughtException')

    logger.debug('IPFS daemon finished')
  }
}

IpfsDaemon.Name = 'ipfs-daemon'
module.exports = IpfsDaemon
