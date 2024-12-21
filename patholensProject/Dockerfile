FROM ubuntu:22.04

RUN apt-get update && apt-get -y --no-install-recommends install \
    python3 \
    python3-pip

WORKDIR /app

COPY ./requirements.txt .

ENV PYTHONUNBUFFERED=1

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
RUN  chmod 777 ./startup_app.sh
ENTRYPOINT ["sh", "./startup_app.sh"]