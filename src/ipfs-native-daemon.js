'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const ipfsd = require('ipfsd-ctl')
const IpfsDaemon = require('./ipfs-daemon.js')

const Logger = require('logplease')
const logger = Logger.create("ipfs-daemon")
Logger.setLogLevel('NONE')

class IpfsNativeDaemon extends IpfsDaemon {
  constructor(options) {
    super(options)

    // Make sure we have the app data directory
    if (!fs.existsSync(this._options.IpfsDataDir))
      mkdirp.sync(this._options.IpfsDataDir)

    // Initialize and start the daemon
    super._start()
  }

  _initDaemon() {
    return new Promise((resolve, reject) => {
      ipfsd.local(this._options.IpfsDataDir, this._options, (err, node) => {
        if(err) 
          reject(err)

        this._daemon = node

        logger.debug("Initializing IPFS daemon")
        logger.debug(`Using IPFS repo at '${node.path}'`)

        this._daemon.init({ directory: this._options.IpfsDataDir }, (err, node) => {          
          if (err) {
            // Check if the IPFS repo is an incompatible one
            const migrationNeeded = String(err).match('ipfs repo needs migration')

            if (migrationNeeded) {
              let errStr = `Error initializing IPFS daemon: '${migrationNeeded[0]}'\n`
              errStr += `Tried to init IPFS repo at '${this._options.IpfsDataDir}', but failed.\n`
              errStr += `Use $IPFS_PATH to specify another repo path, eg. 'export IPFS_PATH=/tmp/orbit-floodsub'.`

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

  _startDaemon() {
    return new Promise((resolve, reject) => {
      logger.debug("Starting IPFS daemon")
      this._daemon.startDaemon(this._options.Flags, (err, ipfs) => {
        if (err)
          return reject(err)

        ipfs.id((err, id) => {
          this._peerId = id.id

          // Assign the IPFS api to this
          Object.assign(this, ipfs)

          logger.debug("Gateway listening at", this.GatewayAddress)
          logger.debug("IPFS daemon started at", this.APIAddress)
          resolve()
        })

      })      
    })
  }

  // Handle shutdown gracefully
  _handleShutdown() {
    if(this._daemon)
      this._daemon.stopDaemon()

    super._handleShutdown()
  }   
}

module.exports = IpfsNativeDaemon
