#!/bin/bash

. ./env.sh

gunicorn --preload chat


