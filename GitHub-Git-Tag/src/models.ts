// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'GitHub::Git::Tag';

    @Exclude()
    protected readonly IDENTIFIER_KEY_OWNER: string = '/properties/Owner';
    @Exclude()
    protected readonly IDENTIFIER_KEY_REPOSITORY: string = '/properties/Repository';
    @Exclude()
    protected readonly IDENTIFIER_KEY_TAG: string = '/properties/Tag';

    @Expose({ name: 'GitHubAccess' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'gitHubAccess', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    gitHubAccess?: Optional<string>;
    @Expose({ name: 'Owner' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'owner', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    owner?: Optional<string>;
    @Expose({ name: 'Repository' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'repository', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    repository?: Optional<string>;
    @Expose({ name: 'Tag' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'tag', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    tag?: Optional<string>;
    @Expose({ name: 'Sha' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'sha', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    sha?: Optional<string>;
    @Expose({ name: 'Force' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'force', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    force?: Optional<boolean>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.owner != null) {
            identifier[this.IDENTIFIER_KEY_OWNER] = this.owner;
        }

        if (this.repository != null) {
            identifier[this.IDENTIFIER_KEY_REPOSITORY] = this.repository;
        }

        if (this.tag != null) {
            identifier[this.IDENTIFIER_KEY_TAG] = this.tag;
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

