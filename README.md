LTLMoPWeb3D
===================

A website for Cornell's Autonomous Systems Lab to essentially have LTLMoP available in 3D and online. See the [Wiki](https://github.com/LTLMoP/LTLMoP/wiki/) for more details.

<br />
(Below taken from the Wiki's Overview)
<hr />

LTLMoPWeb3D is a project to get [LTLMoP](https://github.com/LTLMoP/LTLMoP/wiki/Overview) running on the web as well as add a 3D rendering and physics engine for the simulator.

Currently, LTLMoP requires [a number of dependencies](https://github.com/LTLMoP/LTLMoP/wiki/Installation-Guide) and is relatively tedious to install, especially for an ordinary user that does not have extensive experience with the terminal, Git, or open source libraries. By bringing LTLMoP to the web, only one computer, the server, needs to have an actual copy of LTLMoP installed, while all clients only need a mere browser to access the LTLMoP toolkit. As most people who own computers typically have a browser and internet connection, LTLMoPWeb3D enables practically anyone to start using LTLMoP without a single installation process; all you need to do is access a URL (it even works on mobile phones)!

Creating LTLMoPWeb3D also allows for a much greater audience to start using LTLMoP actively. Whether this be Cornell ASL's developers, other universities' robotics programs, or just a kid trying to experiment with robotics, LTLMoP will now be able to reach many more people, mainly due to the incredibly reduced start up time (installing LTLMoP vs. navigating to a URL).

The second part of the project is the creation of a 3D rendering and physics engine for the LTLMoP simulator. By utilizing a 3D rendering engine instead of the 2D simulator LTLMoP currently has, users will be able to see far more realistic versions of their robot running through their strategy. Running a physics engine on top of this 3D rendering engine allows for even more realistic expectations as well as incredibly precise simulations by allowing the input of constraints (e.g. friction). While this certainly could be created as a new feature of LTLMoP as most engines can run on most machines, this would only further increase LTLMoP's list of dependencies, and dramatically at that. By placing LTLMoP on the web, we once again dramatically reduce dependencies, especially by using currently available engines that can run entirely in the browser through a simple plugin. 

LTLMoPWeb3D will enable anyone to start using LTLMoP with zero start up time and enhanced functionality; using robots has never been easier!
