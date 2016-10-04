'use strict'

const fs = require('fs')
const rmrf = require('rimraf')
const assert = require('assert')
const IpfsDaemon = require('../ipfs-daemon')

const dataDirectory = './.tmp'

describe('ipfs-daemon', function () {
  this.timeout(60000)

  describe('starts a daemon', () => {
    it('IpfsDaemon default options', (done) => {
      IpfsDaemon()
        .then((res) => {
          assert.notEqual(res, null)
          assert.notEqual(res.ipfs, null)
          assert.notEqual(res.daemon, null)
          assert.notEqual(res.Addresses, null)
          assert.notEqual(res.Addresses.Gateway, null)
          res.daemon.stopDaemon()
          rmrf.sync(dataDirectory)
          done()
        })
        .catch(done)
    })

    it('with custom options', (done) => {
      let opts = {
        Flags: ['--enable-pubsub-experiment'],
        AppDataDir: dataDirectory,
        Addresses: {
          API: '/ip4/127.0.0.1/tcp/60320',
          Gateway: '/ip4/0.0.0.0/tcp/60321',
          Swarm: ['/ip4/0.0.0.0/tcp/60322'],
        }
      }

      IpfsDaemon(opts)
        .then((res) => {
          assert.notEqual(res, null)
          assert.notEqual(res.ipfs, null)
          assert.notEqual(res.daemon, null)
          assert.notEqual(res.Addresses, null)
          assert.notEqual(res.Addresses.Gateway, null)
          assert.equal(res.Addresses.Gateway.indexOf('60321') > -1, true)
          res.daemon.stopDaemon()
          rmrf.sync(dataDirectory)
          done()
        })
        .catch(done)
    })

    it('with existing IPFS data directory', (done) => {
      IpfsDaemon()
        .then((res) => {
          res.daemon.stopDaemon()
          IpfsDaemon()
            .then((res) => {
              assert.notEqual(res, null)
              assert.notEqual(res.ipfs, null)
              assert.notEqual(res.daemon, null)
              res.daemon.stopDaemon()
              rmrf.sync(dataDirectory)
              done()
            })
            .catch(done)
        })
        .catch(done)
    })
  })

  describe('starts', () => {
    it('two daemons', (done) => {
      const dir1 = './.tmp1'
      const dir2 = './.tmp2'
      let started  = 0, res1, res2

      IpfsDaemon({ IpfsDataDir: dir1 })
        .then((res) => {
          res1 = res
          started ++
        })
        .catch(done)

      IpfsDaemon({ IpfsDataDir: dir2 })
        .then((res) => {
          res2 = res
          started ++
        })
        .catch(done)

      setTimeout(() => {
        done("Timeout!")
      }, 20000)

      setInterval(() => {
        if (started == 2) {
          assert.notEqual(res1, null)
          assert.notEqual(res2, null)
          res1.daemon.stopDaemon()
          res2.daemon.stopDaemon()
          rmrf.sync(dir1)
          rmrf.sync(dir2)
          rmrf.sync(dataDirectory)
          done()
        }
      }, 1000)
    })

  })
})
