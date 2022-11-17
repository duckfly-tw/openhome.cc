#!/bin/bash
find ./openhome.cc -type f -regex '.*\.css\?[0-9]+\.css$' -exec rename 's/^(.*)\?[0-9]+\.css$/$1/' '{}' \;
find ./openhome.cc -type f -regex '.*\.css\?[0-9]+\.css$' -exec rm '{}' \;
find ./openhome.cc -type f -regex '.*\.js\?[0-9]+$' -exec rename 's/^(.*\.js)\?[0-9]+$/$1/' '{}' \;
find ./openhome.cc -type f -regex '.*\.js\?[0-9]+$' -exec rm '{}' \;
find ./openhome.cc -type f -regex '.*\.html$' -exec sed -ri 's/%3F[0-9]+\.css"/"/g' '{}' \;
find ./openhome.cc -type f -regex '.*\.html$' -exec sed -ri 's/\.js%3F[0-9]+"/\.js"/g' '{}' \;
echo 'finished!';
