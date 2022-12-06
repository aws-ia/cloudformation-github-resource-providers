#!/bin/bash
#
# This script runs in the buildspec before testing
#
# It relies on environment variables to be set to replace placeholder
# values in `example-inputs`.
#
#   GITHUB_ORG
#   GITHUB_REPO
#   GITHUB_USERNAME
#
#   Example
#
#   GITHUB_ORG=ericzbeard-aws-cep-testing GITHUB_REPO=test-stable-1 GITHUB_USERNAME=ezbeard-github-test AWS_PROFILE=ezbeard-cep ./setup.sh

mkdir -p inputs

cat example-inputs/inputs_1_create.json | sed "s/GITHUB_ORG/${GITHUB_ORG}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" | sed "s/GITHUB_USERNAME/${GITHUB_USERNAME}/g" > inputs/inputs_1_create.json
cat example-inputs/inputs_1_update.json | sed "s/GITHUB_ORG/${GITHUB_ORG}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" | sed "s/GITHUB_USERNAME/${GITHUB_USERNAME}/g" > inputs/inputs_1_update.json
cp example-inputs/inputs_1_invalid.json inputs/

# Not practical to make anything unique here.. we should delete the stack after
cat test/integ.yml | sed "s/GITHUB_ORG/${GITHUB_ORG}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" | sed "s/GITHUB_USERNAME/${GITHUB_USERNAME}/g" > test/integ-unique.yml

python3 ../get_type_configuration.py

