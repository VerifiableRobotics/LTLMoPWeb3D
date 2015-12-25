# Table of Contents

I. [Check out the live version](https://ltlmop.herokuapp.com)! <br />
II. See the [Wiki](../../wiki/) for examples and miscellaneous instructions <br />
III. See the [Overview](../../wiki/Overview) for the rationale behind this project <br />
IV. [Installation](#installation) <br />
V. [Development](#development) <br />
VI. [Working on Front End](static/) <br />
VII. [Deployment](deploy/) <br />

# LTLMoP API

The LTLMoP API is a [soon-to-be] file-based API to which one can pass a spec and
regions for compilation and returns the compiler log. Via few simple URLs (and a
unique session token [or API key]), one can access all the compiled artifacts:
the automaton (`/saveAut`), the decomposed regions (`/saveDecomposed`),
the LTL (`/saveLTL`), the SMV (`/saveSMV`), and a new spec file with a mapping
from the original regions to ther decomposed counterparts (`/saveSpec`).

It also currently serves [LTLMoPWeb3D](static/), the web front end to the
LTLMoP API.


## Installation

### Prerequisites

1. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
2. Install [Vagrant](https://www.vagrantup.com/downloads.html)
3. If you do not have `git` on your host machine, you can follow the
   [alternative method](#alternative-method)

#### Alternative Method

1. Create a VM with `vagrant init ubuntu/trusty64; vagrant up;`
2. `vagrant ssh`
3. `cd /vagrant` (this is shared to your host by default)
4. `git clone` the repo
5. `exit`, delete the VirtualBox VM, and delete the .vagrant directory
6. Start from step 2 of [Getting Started](#getting-started)

### Getting Started

1. Clone this repo
2. Change directories to the repo
3. `vagrant up` will create a VM with all dependencies AND run the services
4. Connect to <http://192.168.33.10:5000>


## Development

1. `vagrant up` to start the already created and provisioned VM 
2. `vagrant ssh` will SSH you into the VM
3. Change directories into the the shared older (see Vagrantfile)
4. `docker-compose up -d` will run the API in the background in
   debug and watch mode
5. Connect to <http://192.168.33.10:5000>


## Further Reading

1. [Vagrant Docs](https://docs.vagrantup.com/)
2. [Docker Docs](https://docs.docker.com/)
  * Read the Engine and Compose CLIs
