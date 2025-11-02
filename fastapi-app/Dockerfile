FROM python:3.14-slim

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

COPY ./app /app/app

EXPOSE 9090

ENTRYPOINT ["fastapi", "run", "app/main.py"]

CMD ["--port", "9090"]