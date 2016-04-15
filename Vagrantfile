# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = 'phusion/ubuntu-14.04-amd64'

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network 'private_network', ip: '192.168.33.10'

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network 'public_network'

  # Customize VirtualBox provider
  config.vm.provider 'virtualbox' do |vb|
    vb.memory = '2048'
  end

  # Sync LTLMoP if in the same directory
  if File.directory?('../LTLMoP')
    config.vm.synced_folder '../LTLMoP', '/LTLMoP'
  end
  # Sync cwd to LTLMoPWeb3D (as well as /vagrant of course)
  config.vm.synced_folder './', '/LTLMoPWeb3D'

  # provision the image
  config.vm.provision 'shell', path: 'provision.sh', name: 'provision'
end
