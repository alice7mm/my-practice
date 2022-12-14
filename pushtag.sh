#!/bin/bash

NEW_TAG=`date '+%Y%m%d-%H%M'`
CURRENT_BRANCH=`git symbolic-ref --short HEAD`
git stash push
git switch main
git pull origin main
git tag v${NEW_TAG}
git push origin v${NEW_TAG}
git switch ${CURRENT_BRANCH}
git stash pop
