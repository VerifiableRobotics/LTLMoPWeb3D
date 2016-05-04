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
  # VFS by default, NFS otherwise
  config.vm.synced_folder './', '/vagrant'
  config.vm.synced_folder './', '/vagrant', type: 'nfs'

  # also rsync certain foldes to pass fs events to the VM (sync vs. share)
  config.vm.synced_folder './static', '/web/static', type: 'rsync'
  config.vm.synced_folder './app', '/web/app', type: 'rsync'


  # provision the image
  config.vm.provision 'shell', path: 'provision.sh'
end
