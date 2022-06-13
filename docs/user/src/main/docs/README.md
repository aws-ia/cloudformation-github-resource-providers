
# GitHub CloudFormation Resources

This collection of CloudFormation resource types allow GitHub to be controlled using AWS CloudFormation.

### Why would I want to do this?

Infrastructure-as-code such as CloudFormation is one of the best ways to create and maintain infrastructure that is reliable and secure. Or a CloudFormation template might just be more convenient for some types of automation.

Here are some sample use cases this supports:

* TODO

### How do I get started?

In the AWS CloudFormation UI, find the GitHub types in the third-party registry and activate them.
Alternatively follow the [Developer](../dev) instructions to install them manually.

You will need to set up a [Type Configuration](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cloudformation/set-type-configuration.html)
for each of the activated types, containing a GitHub **Access Token**.
It is recommended to set the access token into Systems Manager's secure parameter store,
e.g. as `/path/to/GitHub/access-token`, and then it can be applied to type `${GitHub_TYPE}`,
e.g. `GitHub::Groups::Group`, using:

```
aws cloudformation set-type-configuration \
--region eu-north-1 \
--type RESOURCE \
--type-name ${GitHub_TYPE} \
--configuration-alias default \
--configuration '{"GitHubAccess": {"AccessToken": "{{resolve:ssm-secure:/path/to/GitHub/access-token}}"}}'
```

You should then be able to run the example use cases above or build your own using the full reference below.


### What is supported?

This project does not support all the objects in GitHub, nor does it support all the properties on the
objects it does support. For many things there just isn't a compelling use case, and of course there are a lot.
We have focussed on those objects and properties which have seemed most useful.
If we missed something, open an issue to let us know, or even better, contribute an extension!

The **Full GitHub CloudFormation Resources Reference** is available [here](resources/).
