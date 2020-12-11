FROM nginx:alpine

# /cstate will be our volume & building directory
WORKDIR /cstate

# Install hugo & git
RUN apk add --no-cache hugo git

# Download the example site
RUN git clone -b master --depth=1 https://github.com/cstate/example /cstate

# Copy files from this repo into themes/cstate
RUN mkdir -p /cstate/themes/cstate
COPY . /cstate/themes/cstate

# Copy entrypoint script into the container image, this runs everytime the container cold-starts.
COPY ./docker/entrypoint.sh /docker-entrypoint.d/10-build-hugo.sh
