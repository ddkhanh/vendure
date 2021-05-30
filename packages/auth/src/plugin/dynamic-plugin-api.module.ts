import { DynamicModule } from '@nestjs/common';

import { Type } from '../../../common/lib/shared-types';
import { notNullOrUndefined } from '../../../common/lib/shared-utils';
import { getConfig } from '../config/config-helpers';

import { getModuleMetadata, graphQLResolversFor, isDynamicModule } from './plugin-metadata';

const dynamicApiModuleClassMap: { [name: string]: Type<any> } = {};

/**
 * This function dynamically creates a Nest module to house any GraphQL resolvers defined by
 * any configured plugins.
 */
export function createDynamicGraphQlModulesForPlugins(apiType: 'authen'): DynamicModule[] {
    return getConfig()
        .plugins.map(plugin => {
            const pluginModule = isDynamicModule(plugin) ? plugin.module : plugin;
            const resolvers = graphQLResolversFor(plugin, apiType) || [];

            if (resolvers.length) {
                const className = dynamicClassName(pluginModule, apiType);
                dynamicApiModuleClassMap[className] = class {};
                Object.defineProperty(dynamicApiModuleClassMap[className], 'name', { value: className });
                const { imports } = getModuleMetadata(pluginModule);
                return {
                    module: dynamicApiModuleClassMap[className],
                    imports: [pluginModule, ...imports],
                    providers: [...resolvers],
                };
            }
        })
        .filter(notNullOrUndefined);
}

/**
 * This function retrieves any dynamic modules which were created with createDynamicGraphQlModulesForPlugins.
 */
export function getDynamicGraphQlModulesForPlugins(apiType: 'authen'): Array<Type<any>> {
    return getConfig()
        .plugins.map(plugin => {
            const pluginModule = isDynamicModule(plugin) ? plugin.module : plugin;
            const resolvers = graphQLResolversFor(plugin, apiType) || [];

            const className = dynamicClassName(pluginModule, apiType);
            return dynamicApiModuleClassMap[className];
        })
        .filter(notNullOrUndefined);
}

function dynamicClassName(module: Type<any>, apiType: 'authen'): string {
    return module.name + `Dynamic` + 'Authen' + 'Module';
}
