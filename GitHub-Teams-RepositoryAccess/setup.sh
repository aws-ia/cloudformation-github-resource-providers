#!/bin/bash
#
# This script runs in the buildspec before testing
#
# It relies on environment variables to be set to replace placeholder
# values in `example-inputs`.
#
#   GITHUB_ORG
#   GITHUB_TEAM
#   GITHUB_REPO
#
# Example
#
#   GITHUB_ORG=ericzbeard-aws-cep-testing GITHUB_TEAM=test-team-1 GITHUB_REPO=test-stable-1 AWS_PROFILE=ezbeard-cep ./setup.sh

mkdir -p inputs

# Repo name needs to be the same for create and update
REPO_UUID=$(uuidgen)
cat example-inputs/inputs_1_create.json | sed "s/GITHUB_ORG/${GITHUB_ORG}/g" | sed "s/GITHUB_TEAM/${GITHUB_TEAM}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" > inputs/inputs_1_create.json
cat example-inputs/inputs_1_update.json | sed "s/GITHUB_ORG/${GITHUB_ORG}/g" | sed "s/GITHUB_TEAM/${GITHUB_TEAM}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" > inputs/inputs_1_update.json
cp example-inputs/inputs_1_invalid.json inputs/

cat test/integ.yml | sed "s/GITHUB_ORG/${GITHUB_ORG}/" | sed "s/GITHUB_TEAM/${GITHUB_TEAM}/g" | sed "s/GITHUB_REPO/${GITHUB_REPO}/g" > test/integ-unique.yml

python3 ../get_type_configuration.py

