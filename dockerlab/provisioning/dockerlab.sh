#! /bin/bash
#
# Provisioning script for dockerlab node

#--------- Bash settings ------------------------------------------------------

# Enable "Bash strict mode"
set -o errexit   # abort on nonzero exitstatus
set -o nounset   # abort on unbound variable
set -o pipefail  # don't mask errors in piped commands

#--------- Variables ----------------------------------------------------------

# Location of provisioning scripts and files
export readonly PROVISIONING_SCRIPTS="/vagrant/provisioning"
# Location of files to be copied to this server
export readonly PROVISIONING_FILES="${PROVISIONING_SCRIPTS}/${HOSTNAME}"

#---------- Load utility functions --------------------------------------------

source ${PROVISIONING_SCRIPTS}/util.sh

#---------- Provision host ----------------------------------------------------

log "Starting server specific provisioning tasks on host ${HOSTNAME}"

log "Installing Docker and dependencies"

dnf install --assumeyes \
  yum-utils

yum-config-manager --add-repo \
  https://download.docker.com/linux/centos/docker-ce.repo

dnf install --assumeyes \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-compose-plugin


log "Configuring Docker"

assign_groups vagrant docker

systemctl enable --now docker

log "Copying provisioning files to host ${HOSTNAME}"

cp "${PROVISIONING_FILES}/"* /home/vagrant

log "Starting Portainer on host ${HOSTNAME}"

docker compose -f /home/vagrant/docker-compose.yml up -d
