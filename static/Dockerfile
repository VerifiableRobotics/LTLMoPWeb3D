FROM node:5.0

# install node requirements
COPY ./package.json /code/package.json
WORKDIR /code
# no symlinks for OSes that don't support them
RUN npm config set bin-links false && npm install

# place js or css into here
VOLUME /code

# run an npm script
#CMD npm
