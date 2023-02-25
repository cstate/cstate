WORK_DIR="/app"
SRC_DIR="/cstate"

echo "[CSTATE-DOCKER] Initalising container..."

# Check if the working dir is empty, if it is we'll need to copy
# the files in from src directory (usually /cstate)
if ! [ "$(ls -A $WORK_DIR)" ]; then
    # First run, copy cstate's files in.
    echo "[CSTATE-DOCKER] Copying cState into staging area. First Start."
    cp -R $SRC_DIR/* $WORK_DIR
fi

cd $WORK_DIR

# Build the hugo site
echo "[CSTATE-DOCKER] Running hugo build service..."
hugo

# Copy built files into NGINX directory
cp -r /$WORK_DIR/public/* /usr/share/nginx/html

echo "[CSTATE-DOCKER] Initalisation complete."