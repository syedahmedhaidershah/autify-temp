#!/usr/bin/bash

if [[ ! -f ./src/metadata/latest.json ]]; then
    echo "{}" > ./src/metadata/latest.json;
else
    echo "Metadata exists";
fi

if [[ $1 == "IT" ]]; then
    sleep infinity;
fi

printf "\nRetrieivng the data from the $@\n"
./fetch $@

echo "Exiting in 5 seconds"
sleep 5