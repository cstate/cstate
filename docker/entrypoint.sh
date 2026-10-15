#!/bin/sh
set -eu

CSTATE_SITE_DIR="${CSTATE_SITE_DIR:-/app}"
mkdir -p "$CSTATE_SITE_DIR"
if [ -z "$(ls -A "$CSTATE_SITE_DIR")" ]; then
    echo "[cState] Initializing the example site."
    cp -R /cstate/. "$CSTATE_SITE_DIR/"
fi

# Build directly into NGINX output so removed pages cannot survive a restart.
# The theme comes from this image; mounted site content and layout overrides persist.
set -- hugo --source "$CSTATE_SITE_DIR" --themesDir /cstate/themes --theme cstate \
    --destination /usr/share/nginx/html --cleanDestinationDir
if [ -n "${CSTATE_BASE_URL:-}" ]; then
    set -- "$@" --baseURL "$CSTATE_BASE_URL"
fi
echo "[cState] Building the status page."
"$@"
echo "[cState] Ready."
