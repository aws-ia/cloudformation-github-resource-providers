# GitHub::Repositories::Collaborator Permissions

The permission granted the collaborator.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "<a href="#pull" title="Pull">Pull</a>" : <i>Boolean</i>,
    "<a href="#triage" title="Triage">Triage</a>" : <i>Boolean</i>,
    "<a href="#push" title="Push">Push</a>" : <i>Boolean</i>,
    "<a href="#maintain" title="Maintain">Maintain</a>" : <i>Boolean</i>,
    "<a href="#admin" title="Admin">Admin</a>" : <i>Boolean</i>
}
</pre>

### YAML

<pre>
<a href="#pull" title="Pull">Pull</a>: <i>Boolean</i>
<a href="#triage" title="Triage">Triage</a>: <i>Boolean</i>
<a href="#push" title="Push">Push</a>: <i>Boolean</i>
<a href="#maintain" title="Maintain">Maintain</a>: <i>Boolean</i>
<a href="#admin" title="Admin">Admin</a>: <i>Boolean</i>
</pre>

## Properties

#### Pull

Recommended for non-code contributors who want to view or discuss your project.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Triage

Recommended for contributors who need to manage issues and pull requests without write access.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Push

Recommended for contributors who actively push to your project.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Maintain

Recommended for project managers who need to manage the repository without access to sensitive or destructive actions.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Admin

Recommended for people who need full access to the project, including sensitive and destructive actions like managing security or deleting a repository.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

