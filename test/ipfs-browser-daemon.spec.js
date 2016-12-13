'use strict'

const path = require('path')
const assert = require('assert')
const IpfsBrowserDaemon = require('../src/ipfs-browser-daemon')

const dataDirectory = '/tmp/ipfs-daemon'
const defaultIpfsDirectory = './ipfs'

const TIMEOUT = 10000

// window.LOG = 'DEBUG'

const hasIpfsApiWithPubsub = (ipfs) => {
  return ipfs.object.get !== undefined
      && ipfs.object.put !== undefined
      // && ipfs.pubsub.publish !== undefined
      // && ipfs.pubsub.subscribe !== undefined
}

[IpfsBrowserDaemon].forEach((IpfsDaemon) => {
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
            done()
          }
        }, 1000)
      })
    })

    describe.skip('errors', () => {
    })
  })
})
