FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

# Ensure data directory exists (volume will mount over /data)
RUN mkdir -p /data

EXPOSE 5000

CMD ["python", "app.py"]
