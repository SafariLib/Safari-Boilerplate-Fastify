# Initialization

-   Update `package.json` **docker** scripts with customized network, volumes and image names.
-   Use the [Dockerfile.dev](../Dockerfile.dev) to enhance container's configuration.

## Set enviroment variables

The following variables must be set in a _.env_ file and/or in the corresponding _docker-compose_ file for the server to launch.

:warning: _Do not expose **POSTGRES\_\*** variables to client!_
| Variable | Description | Format |
|---|---|---|
| `NODE_ENV` | The environment in which the application is running. Can be `development` or `production`. | `string` |
| `POSTGRES_URI` | The DB connection string. | `string` |
| `SECRET_COOKIE` | The secret used to generate the cookie used for authentication. | `string` |
| `SERVER_PORT` | The port on which the application will listen for requests. | `number` |
| `REDIS_URL` | The Redis (cache) connection string. | `number` |
| `REDIS_PORT` | The Redis (cache) port. | `number` |

## Install dependencies

#### Install Docker on your host machine.

-   [Docker desktop (recommended)](https://www.docker.com/products/docker-desktop/)

    _(see https://docs.docker.com/desktop/install/archlinux/ for Arch based distro)_

-   [Docker VSCode extension]('https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker')

## Debug

A port binding of **9229** has been established for debugging purposes in the _package.json_ scripts and _launch.json_ config file. To initiate the debug mode, simply press **F5** within any file.
