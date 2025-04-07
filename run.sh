#!/bin/zsh

# make sure to give permissions to this file
# chmod +x ./run.sh

# Runs the main.js file
# --allow-read: allows files to be read
# -- $@: allows arguments
deno run --allow-read --allow-write taskCli.js "$@"
