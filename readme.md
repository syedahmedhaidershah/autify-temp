# Pre requisites:
1. Docker
2. Docker Buildkit (Optional)

# Usage (Via Docker)
1. Build the image locally using:
```bash
docker build -t autify-test .
```
2. Run the image with network access and bind mounts to review the directory [`extracted`](./extracted/) and the metadata file [`metadata/latest.json`](./metadata/latest.json).
```bash
docker run --rm \
--network host -v \
./extracted/:/home/node/app/src/extracted \
-v ./metadata:/home/node/app/src/metadata autify-test:latest https://www.google.com
```
The command syntax:
```md
docker run -d --rm --network host -v ./extracted/:/home/node/app/src/extracted -v ./metadata:/home/node/app/src/metadata <YOUR_IMAGE_NAME> <ARG1> <ARG2> ... <ARGN>
```

## Note using this as a CLI utility, you can pass all arguments as you would have to the source utility
For eg:
```bash
./fetch --metadata https://example.com
```
Becomes:
```bash
docker run --rm --network host -v ./extracted/:/home/node/app/src/extracted -v ./metadata:/home/node/app/src/metadata autify-test:latest --metadata https://example.com
```

# Alternative usage (1):
1. You can directly invoke the source code by invoking:
```bash
cd src # pushd src - popd after the commands
pnpm i # npm i - if you prefer
cd ..
./fetch https://example.com
# OR ts-node ./src/index.ts https://example.com
```

# Alternative usage (2): (Debugging purposes)
You could also connect your shell to a running container, by the following command which will invoke the background process for `sleep infinity` allowing you to connect and run the command directly:
```bash
CONTAINER_ID=$(docker run -d --rm --network host -v ./extracted/:/home/node/app/src/extracted -v ./metadata:/home/node/app/src/metadata autify-test:latest IT)
docker exec -it $CONTAINER_ID /bin/bash 
# Continue with he alternative steps (1) However everything has been already set up
# It is docker desktop, since I am running docker engine via desktop, you could have a differing host.
node@docker-desktop:~/app$ ./fetch https://example.com
```

