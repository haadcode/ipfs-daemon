'use strict'

const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const assert = require('assert')
const IpfsDaemon = require('../ipfs-daemon')

const dataDirectory = '/tmp/ipfs-daemon'
const defaultIpfsDirectory = './ipfs'

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
          rmrf.sync(defaultIpfsDirectory)
          done()
        })
        .catch(done)
    })

    it('with custom options', (done) => {
      let opts = {
        IpfsDataDir: dataDirectory,
        Flags: ['--enable-pubsub-experiment'],
        LogDirectory: path.join(process.cwd(), '/test/logtest'),
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
          assert.equal(fs.existsSync(opts.IpfsDataDir), true)
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
              rmrf.sync(defaultIpfsDirectory)
              done()
            })
            .catch(done)
        })
        .catch(done)
    })
  })

  describe('starts', () => {
    it('two daemons', (done) => {
      const dir1 = dataDirectory + '/daemon1'
      const dir2 = dataDirectory + '/daemon2'
      let started  = 0, res1, res2

      let addresses = {
        API: '/ip4/127.0.0.1/tcp/0',
        Gateway: '/ip4/0.0.0.0/tcp/0',
        Swarm: ['/ip4/0.0.0.0/tcp/0'],
      }

      IpfsDaemon({ IpfsDataDir: dir1, Addresses: addresses })
        .then((res) => {
          res1 = res
          started ++
        })
        .catch(done)

      IpfsDaemon({ IpfsDataDir: dir2, Addresses: addresses })
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
          rmrf.sync(defaultIpfsDirectory)
          done()
        }
      }, 1000)
    })

  })
})
