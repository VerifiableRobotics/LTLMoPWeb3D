# LTLMoPWeb3D

The front end to the [LTLMoP API](../../../). This contains a Specification
Editor with which to create, edit, and compile and analyze (via the LTLMoP API)
specs, a Simulator with which to visualize your automata in 3D and with
realistic physics, and a Region Editor with which to create, edit, and visualize
regions.

## Installation

## Development

1. Make sure the LTLMoP API is running
2. `docker-compose up -d` will build the front end container and
   run `npm run watch`
  * `npm run watch` will start Webpack in watch mode, recompiling the JS and CSS
    whenever the source files change, outputting them into the `build/` folder
    as specified by the Webpack config
3. Run `vagrant fsnotify` in a separate terminal window to notify the VM when
  a file has been changed
  - Only turn this on when you are _actively_ developing code
  - You will want to kill this process otherwise as it uses `touch` to
    propagate events, meaning it will easily interfere with file deletion,
    particularly when interacting with `git`, which may quickly add and delete
    files during a `rebase`
4. Connect to <http://192.168.33.10:5000>


## Installing New Packages

1. `docker-compose run bash` will start a bash shell
  * `npm install --save-dev <package_name>` will install and save a package
    as a dev dependency
  * `npm install --save <package_name>` will install and save a package as
    a production dependency
  * Alternatively, one can do this all in one-line with
    `docker-compose run npm install --save-dev <package_name>`
2. Require the package where needed in the code


## Creating a Production Build

1. `docker-compose run npm run produce`


## Further Reading

1. [Webpack Docs](https://webpack.github.io/docs/)
2. [Webpack How To](https://github.com/petehunt/webpack-howto)
3. [NPM docs](https://docs.npmjs.com/)
4. [How Instagram Works](https://www.youtube.com/watch?v=VkTCL6Nqm6Y)
5. [Docker Docs](https://docs.docker.com/)
  * Read the Engine and Compose CLIs
