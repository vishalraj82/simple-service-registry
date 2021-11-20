## Simple Service Registry

This is a simple service registry for javascript based applications. It allows you to register services that can be passed along the request chain and be accessed at any point.


#### Using simple service registry

The library has been written in typescript and can be converted in to `es2016` format by running the command - `npm run build`. 

#### Registering a new service

Here is the sample code to use simple service registry

```javascript
// sample.js

import ServiceRegistry from 'simple-service-registry';

const serviceRegistry = new ServiceRegistry();
serviceRegistry.register('config', { config: true });
console.log(serviceRegistry.get('config'))

// Will log - {config: true}
```

The service can hold any type of value such as string, array, object and functions. But functions are treated as exceptions. Lets see by example.


```javascript
// sample.js

import ServiceRegistry from 'simple-service-registry';

const serviceRegistry = new ServiceRegistry();
serviceRegistry.resister('env', 'development')
serviceRegistry.register('configGenerator', function (registry: ServiceRegistry) {
    const env = registry.get('env');
    const configs = {
        dev: {
            env: 'development',
            host: 'localhost'
        },
        prod: {
            env: 'produciton',
            host: 'example.com'
        }
    }
    return function configGenerator() {
        return configs[env];
    }
});

const configGenerator = serviceRegistry.get('config');
const config = configGenerator();
console.log(config);
// Will log - { "env": "development", "host": "localhost" }
```

You can also define and register services as

```javascript
// env.js

export const envService = (registry: ServiceRegistry): void {
    registry.register('env', process.env.NODE_ENV);
}

// config.js

export const configService = (registry: ServiceRegistry): void {
    const env = registry.get('env');
    const config = getConfig(env);  // some function to provide appropriate configuration
    registry.register('config', config);
}

// main.js
import { envService } from './env';
import { configService } from './config';

const serviceRegistry = new ServiceRegistry();
serviceRegistry
    .create(envService)
    .create(configService);

const env = serviceRegistry.get('env');
const config = serviceRegistry.get('config')

```

If you try to register a service with a name, which already exits, then it will throw an exception. Similarly, accessing a service which isn't registered yet, will also throw an exception.