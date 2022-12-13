#!/bin/bash

NEW_TAG=`date '+%Y%m%d-%H%M'`
git switch main
git pull origin main
git tag v${NEW_TAG}
git push origin v${NEW_TAG}
