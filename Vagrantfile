# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "phusion/ubuntu-14.04-amd64"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Customize VirtualBox provider
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "2048"
  end

  # Sync the LTLMoP if on the same drive
  config.vm.synced_folder "../LTLMoP", "/LTLMoP"

  # Only run the provisioning on the first 'vagrant up'
  if Dir.glob("#{File.dirname(__FILE__)}/.vagrant/machines/default/*/id").empty?
    config.vm.provision "shell", path: "initialize.sh" 
  end
end
