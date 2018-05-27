# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.require_version ">= 1.7.0"
# BOX_IMAGE = "ubuntu/xenial64"
BOX_IMAGE = "ubuntu/bionic64"
# BOX_IMAGE = "bento/ubuntu-18.04"


Vagrant.configure("2") do |config|
    config.vm.define "docker" do |docker|
        docker.vm.box = BOX_IMAGE
        docker.vm.network :private_network, ip: "192.168.33.50"
        # CONSUL API PORT
        docker.vm.network :forwarded_port, guest: 8080, host: 8080
        docker.vm.hostname = "docker.kovaro.dev"

        docker.vm.provider "virtualbox" do |vb|
            vb.memory = "256"
            vb.name = "kovaro-docker"
        end
        docker.vm.provision "ansible" do |ansible|
            ansible.verbose = "vv"
            ansible.playbook = "docker.yml"
        end
    end
end
