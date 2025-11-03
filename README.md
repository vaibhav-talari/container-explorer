# About

This project explores Docker and Podman container technology. A simple backend and frontend using `fastapi` framework and `react` library and other supporting technology such as `postgre-sql` for data storage is deployed using the container technology. With this project the following concepts are explored:

- Volumes (bind mount)
- Multi-stage builds
- Networking (bridge driver)

# Docker
- creating docker user-defined network: `docker network create -d bridge cont-expr-net`

# References
- `fastapi` docker implementation [documentation](https://fastapi.tiangolo.com/deployment/docker/#behind-a-tls-termination-proxy)

