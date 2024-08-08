#!/bin/bash

# Script to run this on a dedicated server or local dev instance
# To stop the process, run command ps aux | grep http-serve
# Then find the process id for the correct port and run kill <PID>
# Or run command kill $(lsof -t -i :<PORT>) to find the process id and kill it
# To see the logs in action, run command tail -f logs.log

# The script reads the production tenant table. Replace TENANT_TABLE env var with the appropriate variable if a different env is required

current_datetime=$(date +%Y%m%d_%H%M%S)
logs_folder="logs"
log_file="$logs_folder/logs.log"

if [ ! -d "$logs_folder" ]; then
    mkdir "$logs_folder"
    echo "Created logs folder"
fi

if [ -f "$log_file" ]; then
    cp "$log_file" "$logs_folder/logs_${current_datetime}.log"
    echo "$log_file has been copied to $logs_folder/logs_${current_datetime}.log"
else
    echo "$log_file does not exist"
fi

export PORT=4004
export LOCAL=true
export ENV_REGION=eu-central-1
export TENANT_TABLE=nelson-tenants
export TENANT_PROPS_BUCKET=nelson-tenant-properties
export ACCESSKEY={AWS_ACCESS_KEY}
export SECRETKEY={AWS_SECRET_KEY}
node index_local.js > $log_file 2>&1 &

echo "Nelson tenant management service started on port $PORT"