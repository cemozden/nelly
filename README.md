# Nelly
![TravisCI](https://api.travis-ci.com/cemozden/nelly.svg?branch=master)

Nelly is a real time, web based RSS Feeder written in TypeScript that targets to meet best quality on reading feeds from all over the internet websites, blogs, news channels.

***
## Features
* [x] Real time RSS feed fetching that supports RSS 2.0 Specifications.
* [x] Archiving system to search through previous feeds received in the past.
* [x] dc and content namespace implementations.
* [x] 2 UI themes (Dark Purple, Aqua Light) by default.
* [x] Realtime notifications through Notification API.
* [x] REST APIs to fetch feeds from different applications.
* [x] Rich configuration to set the application settings according to the user will.
* [x] Docker Image support. 
***

## Running Nelly on Docker
Nelly is available on [Docker Hub](https://hub.docker.com/repository/docker/cemozden/nelly/).

In order to start Docker container,
* 6150 port must be published.
* A volume must be created to store db, config etc.
* Created volume must be mounted to /mnt/nelly

Example
```
docker run -d -p 6150:6150 -v "your_volume":/mnt/nelly cemozden/nelly
```

## Installation
```
# via NPM
npm install
npm run compile
npm start
#or
npm install
npm run start-dev

# via yarn
yarn install 
yarn compile
yarn start

or 
yarn install
yarn start-dev
```

## License
2020, MIT License, see [LICENSE](https://github.com/cemozden/nelly/blob/master/LICENSE).