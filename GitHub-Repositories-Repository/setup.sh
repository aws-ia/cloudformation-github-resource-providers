#!/bin/bash
#
# This script runs in the buildspec before testing

# Replace the placeholder group name with something random
cat example_inputs/inputs_1_create.json| sed "s/GROUP_NAME/$(uuidgen)/g" > inputs/inputs_1_create.json
cat example_inputs/inputs_1_update.json| sed "s/GROUP_NAME/$(uuidgen)/g" > inputs/inputs_1_update.json
cat test/integ-template.yml| sed "s/GROUP_NAME/$(uuidgen)/g" > test/integ.yml


