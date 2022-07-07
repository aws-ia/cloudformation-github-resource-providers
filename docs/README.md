This directory contains much of the end-user documentation for this project.

It is built and stored, checked in, in the `generated/` folder for easy consumption by end-users.

It is built from a combination of:

* the files under `src/` here
* the auto-generated `docs/` folder for each resource
* manually added files and examples in `docs-extra/` for each resource

**Do not edit the contents of `generated/` here or in the `docs/` for each resource.**
Edit the `src/` and `docs-extra` instead, and then rebuild with `mvn clean install`.