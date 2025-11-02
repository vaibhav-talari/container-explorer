# About

The fastapi-app is a simple python app exposing few REST API endpoints. 

# Docker Command

- Build container image `docker build -t backendapp`
- Run container `docker run -p 8000:80 backendapp`

# Podman Command

Podman can build images from docker file.

- build image `podman build -t bendimg .`
- run image `podman run --rm localhost/bendimg:latest`

# Create Python Virtual Environment

- `python -m venv backend-venv`

# Activate Virtual Environment

- `source backend-venv/bin/activate`

