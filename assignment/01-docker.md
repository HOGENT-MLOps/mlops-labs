# Lab 1: Docker revisited

In this lab assignment, you will refresh your knowledge of Docker. You will create a Docker image for a simple web application, use port mapping to expose the application to the host system, use volumes to persist data, and use Docker Compose to deploy a multi-container application.

## Learning Goals

- Creating simple Docker images
- Mapping ports from the host to the container
- Using volumes to persist data
- Using Docker Compose to deploy a multi-container application

## Acceptance criteria

- Show that you created a Docker image for the API
- Show that you can access the API on port 3000 on the VM
- Show that you can start the API using the SQLite database
- Show that you can start the API using the MongoDB database
- Show that you optimized the Docker image size
- Show that the tests are passing
- Show your lab report and cheat sheet! It should contain screenshots of consecutive steps and console output of commands you used.

## 1.1 Set up the lab environment

For this lab assignment, we'll be using the `dockerlab` environment. This environment comes with Docker installed on the VM.

First, we'll need to install the required Ansible roles for provisioning the VM. Run the following command from the root of the repository:

```console
bash ./scripts/role-deps.sh ./dockerlab/ansible/site.yml
```

Then, start the `dockerlab` VM:

```console
cd dockerlab
vagrant up
```

## 1.2 Set up Portainer

It's possible to manage Docker containers using the command line, but it's sometimes easier to quickly use a graphical user interface. For this lab assignment, we'll be using [Portainer](https://www.portainer.io/), a web-based GUI for managing Docker containers.

Use the [Portainer docs](https://docs.portainer.io/start/install-ce/server/docker/linux) to set up a Portainer instance on the `dockerlab` VM. Make sure to use the Community Edition (CE) version. Use a `docker-compose.yml` file so it's easier to recreate the Portainer instance if needed.

> If you save files in the folder `/vagrant` on the VM, they will be available on your host system in the `dockerlab` folder. So you can be sure that you won't lose any files if you destroy the VM.

## 1.3 Create a Docker image for a simple web application

In the folde `/vagrant/webapp` on the VM, you'll find a simple web application. The application is written in [Node.js](https://nodejs.org/) and uses [Express](https://expressjs.com/) to serve a simple API on port 3000 with two endpoints:

- `GET /animals`: returns a list of animals
- `GET /animals/:id`: returns a single animal

All animals are generated when the server starts, so it's very likely that you'll get different animals than your fellow students.

This Node.js application requires some dependencies. These dependencies are listed in the `package.json` file. You can install these dependencies using the `yarn install --frozen-lockfile` command. The application can then be started using the `yarn start` command.

> :warning: You'll likely not be able to run these commands on your local machine. You'll need to run them inside a Docker container, that's what we'll do next.

Add a `Dockerfile` to this folder to create a Docker image for this application. Some remarks about the Docker image:

- Start from a Docker image for Node.js version 18.x.x (LTS), you're free to choose an alpine version or not
- The application should be reachable on port 3000
- Copy the application code in the `/app` folder in the container
- The application dependencies should be installed using the `yarn install --frozen-lockfile` command.
- The application should be started using the `yarn start` command.

Make sure the application is started when the container is started.

Test if your Docker image works by running a container based on your image. You should be able to access the application on port 3000 on both endpoints above. You can use the `curl` command to test this.

## 1.4 Create a Docker Compose file

A `docker run` command can become quite long when you need to specify all the options. Luckily, there's a tool called [Docker Compose](https://docs.docker.com/compose/) that allows you to define a multi-container application in a single file. Docker Compose is already installed on the `dockerlab` VM.

> :warning: Docker Compose is now a plugin and should be used as `docker compose` and **not** `docker-compose`.

Create a `docker-compose.yml` file in the `/vagrant/webapp` folder to define a service called `webapp`. This services starts the web application you created in the previous step.

> :warning: It's a good idea to use the `build` option when your still changing the Docker image. This way, Docker Compose will automatically rebuild the image when you start the container.

Start the API using your Docker Compose file. You should be able to access the application on port 3000 on both endpoints above. You can use the `curl` command to test this. Make sure to start the services in the background.

## 1.5 Backup the database

Now the server uses a [SQLite database](https://www.sqlite.org/index.html) to store the animals. This is not ideal, because the database is stored inside the container. This means that if the container is removed, the database is also removed. We can solve this by using a volume to store the database on the host system.

If you run the application, you'll see that the database is stored in the `database` folder. This folder is created by the application if it doesn't exist yet.

Configure the `webapp` service so that the database is stored in a volume on the host system. Make sure that the database is stored in the `database` folder on the host system. If all went well, you should be able to see a `database.sqlite` file in the folder `/vagrant/webapp/database` on the VM.

If you restart the container, it should not print the message "Fake data generated" anymore. If this is the case, you know that the database is persisted on the host system.

## 1.6 Add a database service

Now that the database is persisted on the host system, we can add a second service to the Docker Compose file to run the database. We'll use a [MongoDB](https://www.mongodb.com/) database for this. The application is configured to automatically connect to a MongoDB database if the environment variable `MONGODB_URL` is set. The application will create the database and the collection if they don't exist yet.

> :exclamation: Before you make any changes, create a copy of the `docker-compose.yml` file and name it `docker-compose-sqlite.yml`.

Extend your existing `docker-compose.yml` file to add a service called `database` that runs a MongoDB database. Make sure that the application can connect to the database by setting the `MONGODB_URL` environment variable. Notice you can use the service name as hostname in Docker Compose. Use `depends_on` to make sure that the database is started if the application is started. Remember to start the services in the background.

> :bulb: The API prints a message indicating which database is used. If you see the message "MongoDB database initialized", you know that the application is connected to the MongoDB database.
>
> :bulb: There is also an HTTP header `X-Database-Used` in every response that indicates which database is used.

## 1.7 Optimizing the Docker image

You've probably rebuilt the Docker image a couple of times now. If you look at the output of the `docker images` command, you'll see that the application dependencies are installed every time you rebuild the image. This is not ideal, because the dependencies don't change that often. It would be better to install the dependencies once and then reuse the image. Change the Dockerfile so that the dependencies are installed in a separate layer.

> :buld: Hint: copy the `package.json` and `yarn.lock` files to the container and then run the `yarn install` command. Thereafter, copy the application code to the container.

A last optimization is to add a `.dockerignore` file to the folder. This file is similar to the `.gitignore` file and allows you to exclude files from the Docker context (when building an image). Add the `node_modules` folder and all Docker related files to the `.dockerignore` file.

This image is not so difficult and cannot be optimized that much, but it's a best practice to think about the layers you're creating. Try to keep the image as small as possible. You can use the `docker history` command to see the layers of an image. Docker listed a complete list of best practices for writing Dockerfiles: <https://docs.docker.com/develop/develop-images/dockerfile_best-practices/>.

## 1.8 Testing the application

At last, we want to test the application using integration tests written in [Mocha](https://mochajs.org/). The tests are located in the `/vagrant/webapp/test.js` file and can be run using the `yarn test` command.

Add a new service to the Docker Compose file to run the tests. Set the environment variable `API_URL` to the URL of the `webapp` service. Notice that you can use the service name as hostname in Docker Compose. Use the `depends_on` option to make sure that the application is started before the tests are run. Re-use the existing Docker image to run the tests, **only** change the command in the `docker-compose.yml` file and **not** in the `Dockerfile`.

If you configured everything correctly, you should see three passing tests. If not, read the error message and try to fix the problem.

## Cleanup

You can remove the virtual machine using the following command **after demonstrating the result**. Removing the virtual machine before demonstrating the result will result in losing all your work!

```bash
vagrant destroy -f
```
