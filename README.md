# Okta CloudFormation Resources

This collection of CloudFormation resource types allow Okta to be controlled using AWS CloudFormation.

## Set up git filter

This project uses a filter set up in the [.gitattributes](.gitattributes) file to replace private values for testing within the different `overides.json` on each resource.

The filter has to be added manually inside the `.git/config` file once the repository has been cloned.

Executing this in the console from the project root will add it. Replace the values inside the __square__ brackets with the actual values for testing. E.g.
`[url]` becomes `https://trial-1234567.okta.com`

```properties
cat << EOF >> .git/config
[filter "okta-data"]
	clean = sed \\
		-e 's:[apiKey]:<OKTA_API_KEY>:g' \\
		-e 's:[url]:<OKTA_URL>:g' \\
		-e 's,{,{,g'
	smudge = sed \\
		-e 's:<OKTA_API_KEY>:[apiKey]:g' \\
		-e 's:<OKTA_URL>:[url]:g' \\
        -e 's,{,{,g'
EOF

git checkout .
```
