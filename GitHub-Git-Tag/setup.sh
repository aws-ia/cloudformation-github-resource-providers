#!/bin/bash
#
# This script runs in the buildspec before testing
#
# It relies on environment variables to be set to replace placeholder
# values in `example-inputs`.
#
#   GITHUB_ORG
#   GITHUB_REPO

mkdir -p inputs

cat example-inputs/inputs_1_create.json | sed "s/GITHUB_ORG/${GITHUB_ORG}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" | sed "s/GITHUB_SHA/${GITHUB_SHA}/g" | sed "s/GITHUB_TAG/$(uuidgen)/g" > inputs/inputs_1_create.json
cat example-inputs/inputs_1_update.json | sed "s/GITHUB_ORG/${GITHUB_ORG}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" | sed "s/GITHUB_SHA/${GITHUB_SHA}/g" | sed "s/GITHUB_TAG/$(uuidgen)/g" > inputs/inputs_1_update.json
cp example-inputs/inputs_1_invalid.json inputs/

python3 ../get_type_configuration.py

