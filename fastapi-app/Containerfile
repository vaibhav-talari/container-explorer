FROM python:3.14-slim

WORKDIR /src

COPY ./requirements.txt /src/requirements.txt

RUN pip install --no-cache-dir -r /src/requirements.txt

COPY ./app /src

EXPOSE 5000

ENTRYPOINT ["fastapi", "run", "main.py"]

CMD ["--port", "5000"]