FROM python:3.8-alpine

# set our working directory inside the container (when its finally created from this image)
# depending on your environment you may need to 
# RUN mkdir -p /app
WORKDIR /app

# set environment variables
# Prevents Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
#Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1

#install psycopg2 dependencies
RUN apk update \
    && apk add postgresql-dev gcc python3-dev musl-dev

# upgrade our version of pip
RUN pip install --upgrade pip

# copy requirements to the image
COPY ./requirements.txt /app/requirements.txt

RUN pip3 install -r requirements.txt

#Copy the project
COPY . /app
