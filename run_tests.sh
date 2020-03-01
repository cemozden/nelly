#! /bin/bash

if [ "$TRAVIS_OS_NAME" = 'linux' ]; then
	cd nellyd
	yarn test
fi
