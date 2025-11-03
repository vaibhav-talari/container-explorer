# About

The `simple-frontend` acts as a simple front end application serving a simple html page that utilizes the `fastapi-app` backend. The `index.html` has a section called `Random Number`. The idea with this is to simulate a server-side script rendering and how docker network maps the continers. The client-side javascript call the API's accessiable on the docker port exposed to the host while the interanl API (used in the random number) is a server-side render that makes a call via the docker network.

# The Application can be Started in the Following Manner:

The application can be started in any of the following way. The purpose of this project is to explore container technolgy therefore, `Docker` and `Podman` are explored and in addition starting directly the directly with `go`. With `Docker` and `Podman` the server used in `nginx`.


## Starting the Application with Docker

- build docker image `docker build -t frontendapp .`
- run image `docker run --rm -d --name frontend -p 9000:6000 frontendapp`
- run image with user-defined network `docker run --network cont-expr-net --rm -d --name frontend -p 9000:6000 frontendapp`

## Starting the Application with Go

- start the server: `go run local-test.go`