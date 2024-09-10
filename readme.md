# Notes
> Proposals enhancements are towards the [end](#proposals--enhancements--notes).

# Pre-requisites:
1. Docker
2. Docker Buildkit (Optional)

# Usage
## Via Docker
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
docker run --rm --network host -v ./extracted/:/home/node/app/src/extracted -v ./metadata:/home/node/app/src/metadata <YOUR_IMAGE_NAME> <ARG1> <ARG2> ... <ARGN>
```
#### Successful Run (Via Docker) example:
![Sucessful run via docker](./docs/assets/img/Screenshot%202024-09-10%20at%2013.33.38.png)

### Note using this as a CLI utility, you can pass all arguments as you would have to the source utility
For eg:
```bash
./fetch --metadata https://example.com
```
Becomes:
```bash
docker run --rm --network host -v ./extracted/:/home/node/app/src/extracted -v ./metadata:/home/node/app/src/metadata autify-test:latest --metadata https://example.com
```

## Alternative usage (1):
1. You can directly invoke the source code by invoking:
```bash
cd src # pushd src - popd after the commands
pnpm i # npm i - if you prefer
cd ..
./fetch https://example.com
# OR ts-node ./src/index.ts https://example.com
```

## Alternative usage (2): (Debugging purposes)
You could also connect your shell to a running container, by the following command which will invoke the background process for `sleep infinity` allowing you to connect and run the command directly:
```bash
CONTAINER_ID=$(docker run -d --rm --network host -v ./extracted/:/home/node/app/src/extracted -v ./metadata:/home/node/app/src/metadata autify-test:latest IT)
docker exec -it $CONTAINER_ID /bin/bash 
# Continue with he alternative steps (1) However everything has been already set up
# It is docker desktop, since I am running docker engine via desktop, you could have a differing host.
node@docker-desktop:~/app$ ./fetch https://example.com
```

# Proposals / Enhancements / Notes
1. There are a number of enhancements that could follow:
    - Controllers & Processor callbacks can be broken down and modularized. Skipped due to time constraint
2. Some code has been laid out flat and not modulaized on purpose to remove tight coupling and dependency injection - overuse kills enhancements, creates single point of failure and scalability.
3. Further I could go for cleaning up the code further towards the end since I was in PoC mode:
    - Though my code is already a bit clean, easy to understand, reused and commented clearly, I think I can still clean it up further, if a team member requests, timeboxed at 30 minutes - 1 hour.
4. Functionally this process can be enhanced and setup up for production by not going for a runtime CLI utility and disk, but an event-driven approach,
where the request for scraping / extracting data from a remote origin can be architected and orchestrated via:
    - Event Sources in place:
        - A serialized / FIFO event source, for consumption by:
            a. ETL Controllers / Producers as well as Consumers
            b. Datastore and Database consumers
    - ETL Requests:
        - A message queue system, alllowing for batch requests
        - A Pub/Sub message queue system for actually processing batch request items
        - A management plane / watcher for ETL completions
    - Cached Stores:
        - Since metadata is really hot state data, it can be moved closer to access and end-users by employing a caching or mem-caching layer such as a Redis store.
    - Background / Timed jobs with a TTL and LRU evicition policy to keep used pages up to date whenever retrieved
