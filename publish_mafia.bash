#!/bin/bash
rm -rf ./mafia/ && cp -r ~/projects/mafia_engine/build/web/ mafia && git add . && git commit --amend --no-edit && git push -f
