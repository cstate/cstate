FROM alpine:3.22 AS hugo
ARG HUGO_VERSION=0.158.0
ARG TARGETARCH
RUN apk add --no-cache ca-certificates curl \
    && mkdir /download \
    && cd /download \
    && curl -fsSLO "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-${TARGETARCH}.tar.gz" \
    && curl -fsSLO "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_checksums.txt" \
    && grep " hugo_${HUGO_VERSION}_linux-${TARGETARCH}.tar.gz$" "hugo_${HUGO_VERSION}_checksums.txt" | sha256sum -c - \
    && tar -xzf "hugo_${HUGO_VERSION}_linux-${TARGETARCH}.tar.gz" hugo

FROM nginx:1.28-alpine
RUN apk add --no-cache ca-certificates git && mkdir -p /app \
    && sed -i 's|application/javascript[[:space:]]*js;|application/javascript js mjs;|' /etc/nginx/mime.types
COPY --from=hugo /download/hugo /usr/local/bin/hugo
COPY exampleSite/ /cstate/
COPY . /cstate/themes/cstate/
COPY --chmod=755 docker/entrypoint.sh /docker-entrypoint.d/40-build-hugo.sh
WORKDIR /app
VOLUME ["/app"]
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://127.0.0.1/ || exit 1
