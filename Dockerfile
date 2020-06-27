FROM nginx:alpine

# /cstate will be our volume & building directory
WORKDIR /cstate

# Install hugo & git
RUN apk add hugo git

# -- First Run --

# Download the example site
RUN git clone https://github.com/cstate/example /cstate

# Copy files from this repo into themes/cstate
RUN mkdir -p /cstate/themes/cstate
COPY . /cstate/themes/cstate

# Prepare the entrypoint files
COPY ./docker/entrypoint.sh /docker-entrypoint.d/10-build-hugo.sh