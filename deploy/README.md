# LTLMoP API Deployment

Directions on creating an image of the API, with the LTLMoPWeb3D assets
included, and deploying this image to any server.

## Deploying the LTLMoP API Image

1. If not already installed, install Docker via the first few commands in
   [provision.sh](../provision.sh)
2. `docker run --restart=always -d -p 0.0.0.0:5000:5000 vrrg/ltlmopapi`
  * `0.0.0.0:5000` can be replaced with whatever IP address you would like the
    API to be accessible at
3. The container of the image will now be running in the background with an
   always restart policy in case of any problems


## Creating a LTLMoP API Image

1. First, create a production build of LTLMoPWeb3D, following
   [the directions](../static/#creating-a-production-build)
2. Then, from the [app directory](../app), run
   `docker build -t vrrg/ltlmopapi .`
3. The image should now be created with the tag `vrrg/ltlmopapi`


## Docker Automated Build

Whenever code is pushed to this GitHub repository, a trigger is sent to the
Docker Hub to automatically run the build as specified here and create a public
image wit the tag [`vrrg/ltlmopapi`](https://hub.docker.com/r/vrrg/ltlmopapi).
Builing the image yourself is only useful for development and testing purposes.


## Further Reading

1. [Docker Docs](https://docs.docker.com/)
  * Read the Engine CLI and Hub documentation
