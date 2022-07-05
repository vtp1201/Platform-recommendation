FROM python:3.8.2-slim-buster
# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# Create a working directory for the django project
RUN apt-get update && apt-get upgrade -y && apt-get autoremove && apt-get autoclean
RUN apt-get install -y \
    python3-pip \
    libffi-dev \
    libssl-dev \
    default-libmysqlclient-dev \
    libxml2-dev \
    libxslt-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zlib1g-dev \
    net-tools \
    vim
WORKDIR /code

RUN pip3 install pandas
# Copy requirements to the container
# COPY Pipfile Pipfile.lock /code/
# RUN pip install pipenv
RUN pip3 install -U pipenv
COPY Pipfile Pipfile.lock ./
# Install the requirements to the container
RUN pipenv install --system --deploy --ignore-pipfile
# Copy the project files into the working directory
# COPY . /code/

COPY . .
# Open a port on the container
EXPOSE 8000