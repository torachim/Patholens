FROM ubuntu:22.04

# Install python, pip, npm
RUN apt-get update && apt-get -y --no-install-recommends install \
    python3 \
    python3-pip \
    nodejs \
    npm \
    sqlite3 \
    docker.io \
    docker-compose 

WORKDIR /tmp

COPY ./patholensProject/requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt


WORKDIR /app
