ARG BASE_IMG="20.11-slim"

FROM node:$BASE_IMG AS builder

RUN npm i -g ts-node pnpm typescript
USER node

WORKDIR /home/node/app


COPY --chown=node:node ./src/pnpm-lock.yaml ./
COPY --chown=node:node ./src/package*.json  ./

RUN pnpm i
COPY --chown=node:node . .

RUN chmod +x "./entrypoint.sh" && \
    chmod +x "./fetch"

ENTRYPOINT [ "./entrypoint.sh" ]