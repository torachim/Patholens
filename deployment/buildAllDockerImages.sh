#!/bin/bash

DOCKER_TAG=dev 

if [ "$#" -eq 1 ]
then
    DOCKER_TAG=$1
fi

cd ..

docker build -t patholens:$DOCKER_TAG ./patholensProject
docker build -t devcontainer_patholens:$DOCKER_TAG -f ./.devcontainer/devcontainer.Dockerfile .