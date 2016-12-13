'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const ipfsd = require('@haad/ipfsd-ctl')
const IpfsDaemon = require('./ipfs-daemon.js')

const Logger = require('logplease')
const logger = Logger.create('ipfs-daemon')
Logger.setLogLevel('NONE')

class IpfsNativeDaemon extends IpfsDaemon {
  constructor (options) {
    super(options)

    // Make sure we have the app data directory
    if (!fs.existsSync(this._options.IpfsDataDir)) { mkdirp.sync(this._options.IpfsDataDir) }

    // Handle shutdown signals
    process.on('SIGINT', () => this._handleShutdown)
    process.on('SIGTERM', () => this._handleShutdown)

    // Log errors
    process.on('uncaughtException', (error) => {
      // Skip 'ctrl-c' error and shutdown gracefully
      const match = String(error).match(/non-zero exit code 255/)
      if (match) {
        this._handleShutdown()
      } else {
        logger.error(error)
      }
    })

    super._start()
  }

  _initDaemon () {
    if (this._options.useRunningDaemon) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      ipfsd.local(this._options.IpfsDataDir, this._options, (err, node) => {
        if (err) {
          reject(err)
        }

        this._daemon = node

        logger.debug('Initializing IPFS daemon')
        logger.debug(`Using IPFS repo at '${node.path}'`)

        this._daemon.init({ directory: this._options.IpfsDataDir }, (err, node) => {
          if (err) {
            // Check if the IPFS repo is an incompatible one
            const migrationNeeded = String(err).match('ipfs repo needs migration')

            if (migrationNeeded) {
              let errStr = `Error initializing IPFS daemon: '${migrationNeeded[0]}'\n`
              errStr += `Tried to init IPFS repo at '${this._options.IpfsDataDir}', but failed.\n`
              errStr += `Use $IPFS_PATH to specify another repo path, eg. 'export IPFS_PATH=/tmp/ipfs'.`

              errStr.split('\n').forEach((e) => logger.error(e))

              reject(errStr)
            }
          } else {
            resolve()
          }
        })
      })
    })
  }

  _startDaemon () {
    if (this._options.useRunningDaemon) {
      const host = this._options.useRunningDaemon.split(':')[0]
      const port = this._options.useRunningDaemon.split(':')[1]
      logger.debug("Try using IPFS daemon at '" + this._options.useRunningDaemon + "'")
      const ipfs = this._options.ipfsAPI(host, port)
      return new Promise((resolve, reject) => {
        ipfs.id((err, id) => {
          if (err) {
            const err = `Couldn't find IPFS daemon at '${this._options.useRunningDaemon}'`
            logger.error(err)
            return reject(new Error(err))
          }

          this._peerId = id.id

          // Assign the IPFS api to this
          Object.assign(this, ipfs)

          logger.debug(`Found IPFS daemon at '${this._options.useRunningDaemon}'`)
          resolve()
        })
      })
    }

    return new Promise((resolve, reject) => {
      logger.debug('Starting IPFS daemon')
      this._daemon.startDaemon(this._options.Flags, (err, ipfs) => {
        if (err) {
          return reject(err)
        }

        if (this._options.ipfsAPI) {
          const apiHost = ipfs.apiHost
          const apiPort = ipfs.apiPort

          ipfs = this._options.ipfsAPI(ipfs.apiHost, ipfs.apiPort)

          ipfs.apiHost = apiHost
          ipfs.apiPort = apiPort
        }

        ipfs.id((err, id) => {
          this._peerId = id.id

          // Assign the IPFS api to this
          Object.assign(this, ipfs)

          logger.debug('Gateway listening at', this.GatewayAddress)
          logger.debug('IPFS daemon started at', this.APIAddress)
          resolve()
        })
      })
    })
  }

  // Handle shutdown gracefully
  _handleShutdown () {
    if (this._daemon) {
      this._daemon.stopDaemon()
    }

    super._handleShutdown()
  }
}

IpfsNativeDaemon.Name = 'go-ipfs'
module.exports = IpfsNativeDaemon
