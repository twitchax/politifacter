FROM node as builder
WORKDIR /builder
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build
RUN npm run test

FROM node
WORKDIR politifacter
COPY --from=builder /builder/node_modules node_modules
COPY --from=builder /builder/dist .
ENTRYPOINT node server/start.js