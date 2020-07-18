FROM node:alpine

LABEL MAINTAINER="Cem Ozden <cem@cemozden.com>"

ENV DOCKER_ENVIRONMENT=true

RUN apk add --update --no-cache python3 make g++ gcc
RUN mkdir -p /bin/nelly/src && mkdir -p /bin/nelly/assets

COPY package.json /bin/nelly
COPY tsconfig.json /bin/nelly
COPY copy-assets.js /bin/nelly
COPY .env.prod /bin/nelly
COPY run.sh /bin/nelly
COPY ./assets /bin/nelly/assets/
COPY ./src /bin/nelly/src/

WORKDIR /bin/nelly

RUN npm install && npm run-script compile

EXPOSE 80
VOLUME [ "/mnt/nelly" ]

ENTRYPOINT [ "./run.sh" ]