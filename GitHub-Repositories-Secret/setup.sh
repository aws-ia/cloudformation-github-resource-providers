#!/bin/bash
#
# This script runs in the buildspec before testing
#
# It relies on environment variables to be set to replace placeholder
# values in `example-inputs`.
#
#   GITHUB_OWNER
#   GITHUB_REPO
#
#   Example: 
#
#    GITHUB_OWNER=ericzbeard GITHUB_REPO=test-stable-1 AWS_PROFILE=ezbeard-cep ./setup.sh

mkdir -p inputs

cat example-inputs/inputs_1_create.json | sed "s/GITHUB_OWNER/${GITHUB_OWNER}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" > inputs/inputs_1_create.json
cat example-inputs/inputs_1_update.json | sed "s/GITHUB_OWNER/${GITHUB_OWNER}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" > inputs/inputs_1_update.json
cp example-inputs/inputs_1_invalid.json inputs/

python3 ../get_type_configuration.py