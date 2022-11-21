#!/bin/bash
#
# This script runs in the buildspec before testing
#
# It relies on environment variables to be set to replace placeholder
# values in `example-inputs`.
#
#   GITHUB_ORG
#   GITHUB_REPO
#   GITHUB_SHA
#
#   Example: 
#
#    GITHUB_ORG=ericzbeard-aws-cep-testing GITHUB_REPO=test-stable-1 AWS_PROFILE=ezbeard-cep GITHUB_SHA=6907b5086cfdc46381af05d94c2e41ac6812a962 ./setup.sh

mkdir -p inputs

# Tag name needs to be the same for create and update
TAG_UUID=$(uuidgen)

cat example-inputs/inputs_1_create.json | sed "s/GITHUB_ORG/${GITHUB_ORG}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" | sed "s/GITHUB_SHA/${GITHUB_SHA}/g" | sed "s/GITHUB_TAG/${TAG_UUID}/g" > inputs/inputs_1_create.json
cat example-inputs/inputs_1_update.json | sed "s/GITHUB_ORG/${GITHUB_ORG}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" | sed "s/GITHUB_SHA/${GITHUB_SHA}/g" | sed "s/GITHUB_TAG/${TAG_UUID}/g" > inputs/inputs_1_update.json
cp example-inputs/inputs_1_invalid.json inputs/
cat test/integ.yml | sed "s/TEST_TAG/$(uuidgen)/" > test/integ-unique.yml

python3 ../get_type_configuration.py

