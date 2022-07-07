// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'GitHub::Teams::Team';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ORGANIZATION: string = '/properties/Organization';
    @Exclude()
    protected readonly IDENTIFIER_KEY_SLUG: string = '/properties/Slug';

    @Expose({ name: 'Name' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'name', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    name?: Optional<string>;
    @Expose({ name: 'Organization' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'organization', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    organization?: Optional<string>;
    @Expose({ name: 'Description' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'description', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    description?: Optional<string>;
    @Expose({ name: 'Privacy' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'privacy', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    privacy?: Optional<string>;
    @Expose({ name: 'Slug' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'slug', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    slug?: Optional<string>;
    @Expose({ name: 'GitHubAccess' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'gitHubAccess', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    gitHubAccess?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.organization != null) {
            identifier[this.IDENTIFIER_KEY_ORGANIZATION] = this.organization;
        }

        if (this.slug != null) {
            identifier[this.IDENTIFIER_KEY_SLUG] = this.slug;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 2 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

