all: build

deps:
	npm install

test: deps
	npm run test
	
build: test
	npm run build

clean:
	rm -rf ipfs/
	rm -rf node_modules/

.PHONY: all deps test
