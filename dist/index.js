var IpfsDaemon =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict'
module.exports = __webpack_require__(1)


/***/ },
/* 1 */
/***/ function(module, exports) {

// NOTE: disable for now until js-ipfs is fixed

// 'use strict'

// const IPFS = require('ipfs')
// const IpfsDaemon = require('./ipfs-daemon.js')

// const Logger = require('logplease')
// const logger = Logger.create('ipfs-daemon')
// Logger.setLogLevel('NONE')

// class IpfsBrowserDaemon extends IpfsDaemon {
//   constructor(options) {
//     super(options)

//     this._name = 'js-ipfs'

//     // Initialize and start the daemon
//     super._start()
//   }

//   get GatewayAddress() {
//     return '0.0.0.0:8080/ipfs/'//this._daemon.gatewayAddr ? this._daemon.gatewayAddr + '/ipfs/' : null
//   }

//   get APIAddress() {
//     return this._options.Addresses.Swarm//(this.apiHost && this.apiPort) ? this.apiHost + ':' + this.apiPort : null
//   }

//   _initDaemon() {
//     return new Promise((resolve, reject) => {
//       this._daemon = new IPFS(this._options.IpfsDataDir)
//       this._daemon.init({ emptyRepo: true, bits: 2048 }, (err) => {
//         if (err && err.message !== 'repo already exists') 
//           return reject(err)

//         this._daemon.config.get((err, config) => {
//           if (err)
//             return reject(err)

//           if (this._options.SignalServer) {
//              // Add at least one libp2p-webrtc-star address. Without an address like this
//              // the libp2p-webrtc-star transport won't be installed, and the resulting
//              // node won't be able to dial out to libp2p-webrtc-star addresses.
//             const signalServer = ('/libp2p-webrtc-star/ip4/' + this._options.SignalServer + '/tcp/9090/ws/ipfs/' + config.Identity.PeerID)
//             this._options.Addresses.Swarm = [signalServer]            
//           }

//           this._daemon.config.set('Addresses', this._options.Addresses, (err) => {
//             if (err)
//               return reject(err)

//             this._daemon.load((err) => {
//               if (err)
//                 reject(err)
//               else
//                 resolve()            
//             })
//           })
//         })
//       })
//     })
//   }

//   _startDaemon() {
//     return new Promise((resolve, reject) => {
//       logger.debug('Starting IPFS daemon')
//       this._daemon.goOnline((err) => {
//         if (err)
//           return reject(err)

//         this._daemon.id((err, id) => {
//           this._peerId = id.id
//           // Assign the IPFS api to this
//           Object.assign(this, this._daemon)
//           logger.debug('IPFS daemon started')
//           resolve()
//         })
//       })
//     })
//   }

//   // Handle shutdown gracefully
//   _handleShutdown() {
//     if (this._daemon && this._daemon.isOnline())
//       this._daemon.goOffline()

//     super._handleShutdown()
//   }   
// }

// module.exports = IpfsBrowserDaemon


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ }
/******/ ]);
//# sourceMappingURL=index.js.map