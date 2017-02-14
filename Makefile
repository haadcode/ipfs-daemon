all: test

deps:
	npm install

test: deps
	npm run test:node
	npm run test:browser
	@echo "Run 'make build' to build the stand-alone library for browsers."

build: deps
	npm run build
	cp dist/ipfs-browser-daemon.min.js examples/browser/lib/ipfs-browser-daemon.min.js

clean:
	rm -rf ipfs/
	rm -rf node_modules/

.PHONY: all test
