# GitHub::Repositories::Repository SecurityAndAnalysis

Specify which security and analysis features to enable or disable. For example, to enable GitHub Advanced Security, use this data in the body of the PATCH request: {"security_and_analysis": {"advanced_security": {"status": "enabled"}}}. If you have admin permissions for a private repository covered by an Advanced Security license, you can check which security and analysis features are currently enabled by using a GET /repos/{owner}/{repo} request.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "<a href="#advancesecurity" title="AdvanceSecurity">AdvanceSecurity</a>" : <i><a href="advancesecurity.md">AdvanceSecurity</a></i>,
    "<a href="#secretscanning" title="SecretScanning">SecretScanning</a>" : <i><a href="secretscanning.md">SecretScanning</a></i>,
    "<a href="#secretscanningpushprotection" title="SecretScanningPushProtection">SecretScanningPushProtection</a>" : <i><a href="secretscanningpushprotection.md">SecretScanningPushProtection</a></i>
}
</pre>

### YAML

<pre>
<a href="#advancesecurity" title="AdvanceSecurity">AdvanceSecurity</a>: <i><a href="advancesecurity.md">AdvanceSecurity</a></i>
<a href="#secretscanning" title="SecretScanning">SecretScanning</a>: <i><a href="secretscanning.md">SecretScanning</a></i>
<a href="#secretscanningpushprotection" title="SecretScanningPushProtection">SecretScanningPushProtection</a>: <i><a href="secretscanningpushprotection.md">SecretScanningPushProtection</a></i>
</pre>

## Properties

#### AdvanceSecurity

Use the status property to enable or disable GitHub Advanced Security for this repository. For more information, see "About GitHub Advanced Security." (https://docs.github.com/github/getting-started-with-github/learning-about-github/about-github-advanced-security)

_Required_: No

_Type_: <a href="advancesecurity.md">AdvanceSecurity</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### SecretScanning

Use the status property to enable or disable secret scanning for this repository. For more information, see "About secret scanning." (https://docs.github.com/code-security/secret-security/about-secret-scanning)

_Required_: No

_Type_: <a href="secretscanning.md">SecretScanning</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### SecretScanningPushProtection

Use the status property to enable or disable secret scanning push protection for this repository. For more information, see "Protecting pushes with secret scanning." (https://docs.github.com/code-security/secret-scanning/protecting-pushes-with-secret-scanning)

_Required_: No

_Type_: <a href="secretscanningpushprotection.md">SecretScanningPushProtection</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

