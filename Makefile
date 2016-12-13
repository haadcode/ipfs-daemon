all: build

deps:
	npm install

test: deps
	npm run test:node
	npm run test:browser

build: test
	npm run build
	cp dist/ipfs-browser-daemon.min.js examples/browser/lib/ipfs-browser-daemon.min.js

clean:
	rm -rf ipfs/
	rm -rf node_modules/

.PHONY: all test
