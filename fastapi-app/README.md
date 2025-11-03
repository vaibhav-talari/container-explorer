# About

The `fastapi-app` acts a simple backend app made with python fastapi. Three REST API's are exposed:
- `POST /user`: create a user, accepts JSON `{"name": "", "role": ""}`.
- `GET /user`: get all available users.
- `GET /user/{id}`: get a user based on `id`.
- `GET /network`: returns a random number between 1 to 10 and is accessible only with origin `localhost:6000`. This endpoint is it show docker networking and to show the difference between client-side and server-side loading of Javascript with respect to the `simple-frontend` application.

# The Application can be Started in the Following Manner:

The application can be started in any of the following way. The purpose of this project is to explore container technolgy therefore, `Docker` and `Podman` are explored and in addition starting directly the directly with `python`.

## Starting the Application with Docker

- build docker image `docker build -t backendapp .`
- run image `docker run --rm -d --name backend -p 8000:5000 backendapp`
- run image with blind mount `docker run --mount type=bind,src=./data,dst=/src/data --rm -d --name backend -p 8000:5000 backendapp`
    - with `bind mount` the files can accessed from the host machine.
    - modify the `data/users.csv` file on the hostmachine.
    - the changes will now be reflected in the docker container.
        - view the container directly with `docker exec -it backend /bin/sh`.
        - view from the REST API `/user`.

- run image with user-defined network `docker run --network cont-expr-net --mount type=bind,src=./data,dst=/src/data --rm -d --name backend -p 8000:5000 backendapp`

## Starting the Application with Podman

Podman can build images from docker file.

- build podman image `podman build -t bendimg .`
- run image `podman run --rm -d -p 8000:9090 localhost/bendimg:latest`

## Starting the Application with Python

- create python virtual environment: `python -m venv backend-venv`
- activate virtual environment: `source backend-venv/bin/activate`
- start the server: `fastapi run app/main.py --port 9090`