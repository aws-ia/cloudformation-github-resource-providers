# GitHub::Teams::Membership

Manages people's membership to GitHub teams

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "GitHub::Teams::Membership",
    "Properties" : {
        "<a href="#org" title="Org">Org</a>" : <i>String</i>,
        "<a href="#teamslug" title="TeamSlug">TeamSlug</a>" : <i>String</i>,
        "<a href="#username" title="Username">Username</a>" : <i>String</i>,
        "<a href="#role" title="Role">Role</a>" : <i>String</i>,
    }
}
</pre>

### YAML

<pre>
Type: GitHub::Teams::Membership
Properties:
    <a href="#org" title="Org">Org</a>: <i>String</i>
    <a href="#teamslug" title="TeamSlug">TeamSlug</a>: <i>String</i>
    <a href="#username" title="Username">Username</a>: <i>String</i>
    <a href="#role" title="Role">Role</a>: <i>String</i>
</pre>

## Properties

#### Org

The organization name. The name is not case sensitive. If not specified, then the managed repository will be within the currently logged-in user account.

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### TeamSlug

TThe slug of the team name.

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Username

The handle for the GitHub user account.

_Required_: No

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Role

The handle for the GitHub user account.

_Required_: No

_Type_: String

_Allowed Values_: <code>member</code> | <code>maintainer</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### State

Membership state

