#!/bin/bash

for var in "$@"
do
    ffmpeg -i $var ${var%.*}.wav
done