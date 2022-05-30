# GitHub::Teams::Team

Manage a team in Github

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "GitHub::Teams::Team",
    "Properties" : {
        "<a href="#name" title="Name">Name</a>" : <i>String</i>,
        "<a href="#organization" title="organization">organization</a>" : <i>String</i>,
        "<a href="#description" title="Description">Description</a>" : <i>String</i>,
        "<a href="#privacy" title="Privacy">Privacy</a>" : <i>String</i>,
        "<a href="#githubaccess" title="GitHubAccess">GitHubAccess</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: GitHub::Teams::Team
Properties:
    <a href="#name" title="Name">Name</a>: <i>String</i>
    <a href="#organization" title="organization">organization</a>: <i>String</i>
    <a href="#description" title="Description">Description</a>: <i>String</i>
    <a href="#privacy" title="Privacy">Privacy</a>: <i>String</i>
    <a href="#githubaccess" title="GitHubAccess">GitHubAccess</a>: <i>String</i>
</pre>

## Properties

#### Name

Team name

_Required_: Yes

_Type_: String

_Pattern_: <code>^[a-zA-Z0-9_-]{1,512}$</code>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### organization

The organization that the team will belong to

_Required_: Yes

_Type_: String

_Pattern_: <code>^[a-zA-Z0-9_-]{1-39}$</code>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Description

Describe the team

_Required_: No

_Type_: String

_Pattern_: <code>^[a-zA-Z0-9_-]{1,512}$</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Privacy

The privacy for the team - must be either secret or closed

_Required_: No

_Type_: String

_Allowed Values_: <code>secret</code> | <code>closed</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### GitHubAccess

Personal access token

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Slug

The organization unique identifier for the team

