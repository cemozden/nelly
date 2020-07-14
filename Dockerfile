FROM node:latest

LABEL MAINTAINER="Cem Ozden <cem@cemozden.com>"
ENV DOCKER_ENVIRONMENT=true

RUN apt-get update -y

RUN mkdir -p /nelly/src && mkdir -p /nelly/assets

COPY package.json /nelly
COPY tsconfig.json /nelly
COPY copy-assets.js /nelly
COPY .env.prod /nelly
COPY run.sh /nelly

COPY ./assets /nelly/assets/
COPY ./src /nelly/src/
WORKDIR /nelly

RUN npm install && npm run-script compile

EXPOSE 6150
VOLUME [ "/nelly/resources" ]
ENTRYPOINT [ "./run.sh" ]