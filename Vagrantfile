# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.require_version ">= 1.7.0"
BOX_IMAGE = "ubuntu/xenial64"

Vagrant.configure("2") do |config|
    config.vm.define "uaa" do |uaa|
        uaa.vm.box = BOX_IMAGE
        uaa.vm.network :private_network, ip: "192.168.33.#{50+machine_id}"
        # CONSUL API PORT
        uaa.vm.network :forwarded_port, guest: 8500, host: "#{8780+machine_id}"
        # DNS port
        uaa.vm.network :forwarded_port, guest: 8600, host: "#{8880+machine_id}", protocol: "udp"
        uaa.vm.hostname = "consul#{machine_id}.kovaro.dev"

        uaa.vm.provider "virtualbox" do |vb|
            vb.memory = "256"
            vb.name = "kovaro-consul#{machine_id}"
        end
        if machine_id == N
            uaa.vm.provision "ansible" do |ansible|
                ansible.verbose = "v"
                ansible.limit = "all"
                ansible.playbook = "consul.yml"
                ansible.groups = {
                    "consul" => ["consul[1:#{CONSUL_N}]"]
                }
            end
        end
    end
end
