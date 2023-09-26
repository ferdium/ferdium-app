# Note: Before running this file, you should have already cloned the git repo + submodules on the host machine. This is used when actively developing on your local machine, but you want to build for a different architecture

FROM docker.io/library/node:18.18.0-buster as builder

ENV PATH="/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:/usr/local/lib:/usr/include:/usr/share"

ARG DEBIAN_FRONTEND=noninteractive
# Note: This is added for building on ARM machines
ARG USE_SYSTEM_FPM=true
# Note: Added to bypass the error with missing git repo information for the 'preval-build-info' module
ARG PREVAL_BUILD_INFO_PLACEHOLDERS=true

# Note: 'fpm' is needed for building on ARM machines
RUN apt-get update -y \
  && apt-get install --no-install-recommends -y rpm ruby gem \
  && gem install fpm --no-ri --no-rdoc --no-document

WORKDIR /usr/src/ferdium

COPY package*.json ./
COPY .npmrc ./

RUN npm i -gf "pnpm@$(node -p 'require("./package.json").engines.pnpm')" && pnpm -v

RUN pnpm i

COPY . .

WORKDIR /usr/src/ferdium/recipes

RUN pnpm i && pnpm lint && pnpm reformat-files && pnpm package

WORKDIR /usr/src/ferdium

RUN pnpm build --dir

# --------------------------------------------------------------------------------------------

FROM docker.io/library/busybox:latest

WORKDIR /ferdium

COPY --from=builder /usr/src/ferdium/out/* /ferdium/

VOLUME [ "/ferdium-out" ]
