# GitHub::Repositories::Repository SecretScanningPushProtection

Use the status property to enable or disable secret scanning push protection for this repository. For more information, see "Protecting pushes with secret scanning." (https://docs.github.com/code-security/secret-scanning/protecting-pushes-with-secret-scanning)

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "<a href="#status" title="Status">Status</a>" : <i>String</i>
}
</pre>

### YAML

<pre>
<a href="#status" title="Status">Status</a>: <i>String</i>
</pre>

## Properties

#### Status

Can be enabled or disabled.

_Required_: Yes

_Type_: String

_Allowed Values_: <code>enabled</code> | <code>disabled</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

