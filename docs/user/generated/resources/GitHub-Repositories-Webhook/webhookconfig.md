# GitHub::Repositories::Webhook WebhookConfig

Key/value pairs to provide settings for this webhook

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "<a href="#contenttype" title="ContentType">ContentType</a>" : <i>String</i>,
    "<a href="#url" title="Url">Url</a>" : <i>String</i>,
    "<a href="#secret" title="Secret">Secret</a>" : <i>String</i>,
    "<a href="#insecuressl" title="InsecureSsl">InsecureSsl</a>" : <i>Double</i>
}
</pre>

### YAML

<pre>
<a href="#contenttype" title="ContentType">ContentType</a>: <i>String</i>
<a href="#url" title="Url">Url</a>: <i>String</i>
<a href="#secret" title="Secret">Secret</a>: <i>String</i>
<a href="#insecuressl" title="InsecureSsl">InsecureSsl</a>: <i>Double</i>
</pre>

## Properties

#### ContentType

The media type used to serialize the payloads. Supported values include json and form. The default is form.

_Required_: No

_Type_: String

_Allowed Values_: <code>form</code> | <code>json</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Url

The URL to which the payloads will be delivered.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Secret

If provided, the secret will be used as the key to generate the HMAC hex digest value for delivery signature headers.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### InsecureSsl

Determines whether the SSL certificate of the host for url will be verified when delivering payloads. Supported values include 0 (verification is performed) and 1 (verification is not performed). The default is 0. We strongly recommend not setting this to 1 as you are subject to man-in-the-middle and other attacks.

_Required_: No

_Type_: Double

_Allowed Values_: <code>0</code> | <code>1</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

