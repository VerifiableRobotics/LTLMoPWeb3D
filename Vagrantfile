# -*- mode: ruby -*-
# vi: set ft=ruby :

# install any plugins required to run this VM properly
required_plugins = %w(vagrant-fsnotify)
required_plugins.each do |plugin|
  unless (Vagrant.has_plugin? plugin) || ARGV[0] == 'plugin'
    exec "vagrant plugin install #{plugin};vagrant #{ARGV.join(' ')}"
  end
end

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

  # sync the codebase to /LTLMoPWeb3D
  config.vm.synced_folder './', '/vagrant', disabled: true # disable default
  # VFS by default, NFS if available
  config.vm.synced_folder './', '/LTLMoPWeb3D', fsnotify: true
  config.vm.synced_folder './', '/LTLMoPWeb3D', type: 'nfs', fsnotify: true

  # provision the image
  config.vm.provision 'shell', path: 'provision.sh'
end
