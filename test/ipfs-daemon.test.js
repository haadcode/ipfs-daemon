'use strict'

const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const assert = require('assert')
const IpfsNodeDaemon = require('../src/ipfs-node-daemon')
const IpfsNativeDaemon = require('../src/ipfs-native-daemon')
const IpfsBrowserDaemon = require('../src/ipfs-browser-daemon')

const dataDirectory = '/tmp/ipfs-daemon'
const defaultIpfsDirectory = './ipfs'

const TIMEOUT = 60000

if (typeof window !== 'undefined') { window.LOG = 'NONE' }

const hasIpfsApiWithPubsub = (ipfs) => {
  return ipfs.object.get !== undefined
      && ipfs.object.put !== undefined
      // && ipfs.pubsub.publish !== undefined
      // && ipfs.pubsub.subscribe !== undefined
}

[IpfsNodeDaemon, IpfsNativeDaemon].forEach((IpfsDaemon) => {
  describe('ipfs-daemon', function () {
    this.timeout(TIMEOUT)

    describe('starts a daemon', () => {
      it('IpfsDaemon default options', (done) => {
        const ipfs = new IpfsDaemon()
        ipfs.on('error', done)
        ipfs.on('ready', () => {
          assert.equal(hasIpfsApiWithPubsub(ipfs), true)
          // assert.equal(ipfs.GatewayAddress, "0.0.0.0:8080/ipfs/")
          // assert.equal(ipfs.APIAddress, "127.0.0.1:5001")
          ipfs.stop()
          rmrf.sync(defaultIpfsDirectory)
          done()
        })
      })

      it('with custom options', (done) => {
        let opts = {
          IpfsDataDir: dataDirectory,
          Flags: ['--enable-pubsub-experiment'],
          LogDirectory: '/tmp',
          Addresses: {
            API: '/ip4/127.0.0.1/tcp/60320',
            Gateway: '/ip4/0.0.0.0/tcp/60321',
            Swarm: ['/ip4/0.0.0.0/tcp/60322']
          }
        }

        const ipfs = new IpfsDaemon(opts)
        ipfs.on('error', done)
        ipfs.on('ready', (res) => {
          assert.equal(hasIpfsApiWithPubsub(ipfs), true)
          // assert.equal(fs.existsSync(opts.IpfsDataDir), true)
          // assert.equal(ipfs.GatewayAddress.indexOf('60321') > -1, true)
          // assert.equal(ipfs.APIAddress.indexOf('60320') > -1, true)
          ipfs.stop()
          rmrf.sync(dataDirectory)
          done()
        })
      })

      it('with existing IPFS data directory', (done) => {
        const ipfs1 = new IpfsDaemon()
        ipfs1.on('error', done)
        ipfs1.on('ready', (res) => {
          ipfs1.stop()
          let ipfs2 = new IpfsDaemon()
          ipfs2.on('error', done)
          ipfs2.on('ready', () => {
            assert.equal(hasIpfsApiWithPubsub(ipfs2), true)
            ipfs2.stop()
            rmrf.sync(defaultIpfsDirectory)
            done()
          })
        })
      })

      it('sets PeerId', (done) => {
        const ipfs = new IpfsDaemon()
        ipfs.on('error', done)
        ipfs.on('ready', () => {
          assert.notEqual(ipfs.PeerId, null)
          ipfs.stop()
          rmrf.sync(defaultIpfsDirectory)
          done()
        })
      })
    })

    describe('starts', () => {
      it('two daemons', (done) => {
        const dir1 = dataDirectory + '/daemon1'
        const dir2 = dataDirectory + '/daemon2'
        let started = 0, res1, res2

        let addresses = {
          API: '/ip4/127.0.0.1/tcp/0',
          Gateway: '/ip4/0.0.0.0/tcp/0',
          Swarm: ['/ip4/0.0.0.0/tcp/0']
        }

        const ipfs1 = new IpfsDaemon({ IpfsDataDir: dir1, Addresses: addresses })
        ipfs1.on('error', done)
        ipfs1.on('ready', () => started++)

        const ipfs2 = new IpfsDaemon({ IpfsDataDir: dir2, Addresses: addresses })
        ipfs2.on('error', done)
        ipfs2.on('ready', () => started++)

        const timeout = setTimeout(() => {
          done('Timeout!')
        }, TIMEOUT)

        const checkInterval = setInterval(() => {
          if (started == 2) {
            clearTimeout(timeout)
            clearInterval(checkInterval)
            assert.equal(hasIpfsApiWithPubsub(ipfs1), true)
            assert.equal(hasIpfsApiWithPubsub(ipfs2), true)
            ipfs1.stop()
            ipfs2.stop()
            rmrf.sync(dir1)
            rmrf.sync(dir2)
            rmrf.sync(defaultIpfsDirectory)
            done()
          }
        }, 1000)
      })
    })

    describe('errors', () => {
      it('emit s an error when API address is already in use', (done) => {
        // Skip this test when run in the browser
        if (IpfsDaemon.Name === 'js-ipfs-browser') {
          done()
        }

        const dir1 = dataDirectory + '/daemon1'
        const dir2 = dataDirectory + '/daemon2'

        const ipfs1 = new IpfsDaemon({ IpfsDataDir: dir1 })
        ipfs1.on('ready', (res) => {
          const ipfs2 = new IpfsDaemon({ IpfsDataDir: dir2 })
          ipfs2.on('error', (err) => {
            const match = String(err).match(/address already in use|EADDRINUSE/)
            assert.notEqual(err, null)
            // assert.equal(match[0], 'address already in use')
            ipfs1.stop()
            ipfs2.stop()
            rmrf.sync(dir1)
            rmrf.sync(dir2)
            done()
          })
        })
      })

      it('doesn\'t set PeerId if start daemon errors', (done) => {
        // Skip this test when run in the browser
        if (IpfsDaemon.Name === 'js-ipfs-browser') {
          done()
        }

        const dir1 = dataDirectory + '/daemon1'
        const dir2 = dataDirectory + '/daemon2'

        const ipfs1 = new IpfsDaemon({ IpfsDataDir: dir1 })
        ipfs1.on('ready', (res) => {
          const ipfs2 = new IpfsDaemon({ IpfsDataDir: dir2 })
          ipfs2.on('error', (err) => {
            assert.equal(ipfs2.PeerId, null)
            ipfs1.stop()
            ipfs2.stop()
            rmrf.sync(dir1)
            rmrf.sync(dir2)
            done()
          })
        })
      })

      it('emit s an error when Gateway address is already in use', (done) => {
        // Skip this test when run in node.js or in the browser
        if (IpfsDaemon.Name === 'js-ipfs-browser' || IpfsDaemon.Name === 'js-ipfs') {
          return done()
        }

        const dir1 = dataDirectory + '/daemon1'
        const dir2 = dataDirectory + '/daemon2'

        const addr1 = {
          API: '/ip4/127.0.0.1/tcp/0',
          Gateway: '/ip4/0.0.0.0/tcp/8080',
          Swarm: ['/ip4/0.0.0.0/tcp/0']
        }

        const addr2 = {
          API: '/ip4/127.0.0.1/tcp/0',
          Gateway: '/ip4/0.0.0.0/tcp/8080',
          Swarm: ['/ip4/0.0.0.0/tcp/0']
        }

        const ipfs1 = new IpfsDaemon({ IpfsDataDir: dir1, Addresses: addr1 })
        ipfs1.on('ready', (res) => {
          const ipfs2 = new IpfsDaemon({ IpfsDataDir: dir2, Addresses: addr2 })
          ipfs2.on('error', (err) => {
            console.log(err)
            const match = String(err).match(/address already in use|EADDRINUSE/)
            assert.notEqual(err, null)
            // assert.equal(match[0], 'address already in use')
            ipfs1.stop()
            ipfs2.stop()
            rmrf.sync(dir1)
            rmrf.sync(dir2)
            done()
          })
        })
      })
    })
  })
})
