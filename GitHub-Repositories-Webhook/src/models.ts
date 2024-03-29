// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'GitHub::Repositories::Webhook';

    @Exclude()
    protected readonly IDENTIFIER_KEY_OWNER: string = '/properties/Owner';
    @Exclude()
    protected readonly IDENTIFIER_KEY_REPOSITORY: string = '/properties/Repository';
    @Exclude()
    protected readonly IDENTIFIER_KEY_ID: string = '/properties/Id';

    @Expose({ name: 'Owner' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'owner', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    owner?: Optional<string>;
    @Expose({ name: 'Name' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'name', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    name?: Optional<string>;
    @Expose({ name: 'Active' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'active', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    active?: Optional<boolean>;
    @Expose({ name: 'Id' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'id', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    id?: Optional<number>;
    @Expose({ name: 'Events' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'events', value, obj, [Set]),
        {
            toClassOnly: true,
        }
    )
    events?: Optional<Set<string>>;
    @Expose({ name: 'Repository' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'repository', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    repository?: Optional<string>;
    @Expose({ name: 'ContentType' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'contentType', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    contentType?: Optional<string>;
    @Expose({ name: 'Url' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'url', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    url?: Optional<string>;
    @Expose({ name: 'Secret' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'secret', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    secret?: Optional<string>;
    @Expose({ name: 'InsecureSsl' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'insecureSsl', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    insecureSsl?: Optional<number>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.owner != null) {
            identifier[this.IDENTIFIER_KEY_OWNER] = this.owner;
        }

        if (this.repository != null) {
            identifier[this.IDENTIFIER_KEY_REPOSITORY] = this.repository;
        }

        if (this.id != null) {
            identifier[this.IDENTIFIER_KEY_ID] = this.id;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 3 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

export class TypeConfigurationModel extends BaseModel {
    ['constructor']: typeof TypeConfigurationModel;


    @Expose({ name: 'GitHubAccess' })
    @Type(() => GitHubAccess)
    gitHubAccess?: Optional<GitHubAccess>;

}

export class GitHubAccess extends BaseModel {
    ['constructor']: typeof GitHubAccess;


    @Expose({ name: 'AccessToken' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'accessToken', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    accessToken?: Optional<string>;

}

