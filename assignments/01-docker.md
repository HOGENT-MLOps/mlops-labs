# Lab 1: Docker revisited

In this lab assignment, you will refresh your knowledge of Docker. You will create a Docker image for a simple web application, use port mapping to expose the application to the host system, use volumes to persist data, and use Docker Compose to deploy a multi-container application.

## :mortar_board: Learning Goals

- Understanding the concept of container virtualization
- Understanding the basic building blocks of Docker
- Understanding the concept of Docker Compose
- Being able to build Docker images and run them as Docker containers
- Being able to use Docker features like port bindings, volumes, environment variables...
- Being able to manage multiple containers using Docker Compose
- Being able to push Docker images to a Docker registry

## :memo: Acceptance criteria

- Show that you created a Docker image for the API
- Show that you can start the API using the SQLite database
- Show that you can start the API using the MySQL database
- Show that you can access the API on port 3000
- Show that you optimized the Docker image size
  - You've used an Alpine version of Node.js
  - You've copied and installed the dependencies in a separate layer
- Show all running containers in the Portainer dashboard
- Show that all tests are passing
- Show that you pushed the Docker image to Docker Hub and that you can pull it from Docker Hub
- Show that you wrote an elaborate lab report in Markdown and pushed it to the repository
- Show that you updated the cheat sheet with the commands you need to remember

## 1.1 Set up the lab environment

Before you can start this lab assignment, you need to make sure Docker is installed on your local machine. Check if Docker is already installed through a package manager (e.g. `choco`, `brew`, `apt`, `dnf`, `pacman`... depending on your operating system). If so, update Docker to the latest version. If not installed, install preferably using a package manager or alternatively using the documentation below:

- Windows: use [Docker Desktop](https://docs.docker.com/desktop/) in combination with the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install)
- macOS: use [Docker Desktop](https://docs.docker.com/desktop/)
- Linux: use [Docker Engine](https://docs.docker.com/engine/install/) and **not** Docker Desktop

## 1.2 Configure Portainer

It's possible to manage Docker containers using the command line, but it's sometimes easier to quickly use a graphical user interface.

For this lab assignment, we'll be using [Portainer](https://www.portainer.io/), a web-based GUI for managing Docker containers. You'll find a file `docker-compose.portainer.yml` in the folder `dockerlab`. This file contains the configuration to run a Portainer container. Start the Portainer container!

If all went well, you should be able to access the Portainer dashboard via <https://localhost:9443>. Ignore the warning about HTTPS and create an admin user. You can use the default settings for the other options.

> :bulb: If you've waited to long before creating an admin user, Portainer will show a timeout error. You can fix this by restarting the Portainer container.

## 1.3 Create a Docker image for a simple web application

You'll find a simple web application in the folder `dockerlab/webapp`. The application is written in [Node.js](https://nodejs.org/) and uses [Express](https://expressjs.com/) to serve a simple API on port 3000 with two endpoints:

- `GET /animals`: returns a list of animals
- `GET /animals/:id`: returns a single animal (with the given `id` if exists)

All animals are generated when the server starts for the first time, so it's very likely that you'll get different animals than your fellow students.

This Node.js application requires some dependencies. These dependencies are listed in the `package.json` file and can be installed using the `yarn install --frozen-lockfile` command. Then use the `yarn start` command to start the application.

> :warning: You'll likely not be able to run these commands on your local or virtual machine. You need to run them inside a Docker container, that's what we'll do next.

Add a `Dockerfile` to this folder to create a Docker image for this application. The Docker image should meet the following requirements:

- Start from a Docker image for Node.js version 20.x.x (LTS).
- The application should be reachable on port 3000.
- Copy the application code in the `/app` folder in the container.
- Install the application dependencies with the `yarn install --frozen-lockfile` command.
- The application should be started using the `yarn start` command (when the container is started).

Test if your Docker image works by running a container based on your image. You may choose the Docker image name but it might be a good idea to pick `webapp`. You should be able to access the application on port 3000 on both endpoints above. You can use the `curl` command to test this.

## 1.4 Create a Docker Compose file

A `docker run` command can become quite long when you need to specify all the options. Luckily, there's a tool called [Docker Compose](https://docs.docker.com/compose/) that allows you to define a multi-container application in a single file. Docker Compose is already installed for those who use Docker Desktop. If you're using Docker Engine, you need to install Docker Compose separately using the [instructions on the Docker website](https://docs.docker.com/compose/install/linux/#install-using-the-repository).

> :warning: Docker Compose is now a plugin and should be used as `docker compose` and **not** `docker-compose`.

Create a `docker-compose.yml` file in the `dockerlab/webapp` folder to define a service called `webapp`. This services starts the web application image you created in the previous step.

> :bulb: It's a good idea to use the `build` option when your still changing the Docker image. This way, Docker Compose will automatically rebuild the image when you start the container.

Start the API using your Docker Compose file. You should be able to access the application on port 3000 on both endpoints above. You can use the `curl` command to test this. Make sure to start the services in the background.

## 1.5 Backup the database

At this moment, the server uses a [SQLite database](https://www.sqlite.org/index.html) to store the animals. This is not ideal, because the database is stored inside the container. This means that if the container is removed, the database is also removed. We can solve this by using a volume to store the database on the host system.

Use `docker exec` to get a shell inside the container. If you've used an alpine version of the Node.js image, you'll need to use the `sh` command instead of `bash`.

List the contents of the `/app` folder. You should notice a `database` folder that is not present on your host system. This folder contains the SQLite database file.

Configure the `webapp` service so that the database is stored in a volume on the host system. If all went well, you should be able to see a `database.sqlite` file in the folder `dockerlab/webapp/database`.

Prevent this file from being added to the repository by adding the `dockerlab/webapp/database` folder to the `.gitignore` file.

Re-run you `docker-compose.yml` file, restarting the container is not sufficient. The webapp container should not print the message "Fake data generated" anymore. If this is the case, you know that the database is persisted on the host system.

## 1.6 Add a database service

Now that the database is persisted on the host system, we can add a second service to the Docker Compose file to run a more robust database. We'll use a [MySQL](https://www.mysql.com/) database for this. The application is configured to automatically connect to a MySQL database if the environment variable `MYSQL_URL` is set. The application will create the database and the collection if they don't exist yet.

> :exclamation: Before you make any changes, create a copy of the `docker-compose.yml` file and name it `docker-compose-sqlite.yml`.

Extend your existing `docker-compose.yml` file to add a service called `database` that runs a [MySQL database](https://hub.docker.com/_/mysql). Read the Docker container docs and set the appropriate environment variables to configure the database and user.

Make sure that the application can connect to the database by setting the `MYSQL_URL` environment variable. Notice you can use the service name as hostname in Docker Compose. Use `depends_on` to make sure that the database is started if the application is started. Remember to start the services in the background.

> :bulb: The API prints a message indicating which database is used. If you see the message "MySQL database initialized", you know that the application is connected to the MySQL database.
>
> :bulb: There is also an HTTP header `X-Database-Used` in every response that indicates which database is used.

In a real-world scenario, it's a bad idea to expose your database to the outside world. First think if public access is really necessary. If so, you should only allow traffic from specific domains or IP addresses. You should block all other incoming traffic by using a firewall, but this is outside the scope of this course.

## 1.7 Backup the database

The MySQL database is now stored inside a Docker container. This again means that if the container is removed, the database is also removed. We can solve this by using a volume to store the database on the host system.

Search through the documentation of the [MySQL Docker image](https://hub.docker.com/_/mysql) to find out where the data is stored in the container. Create a named volume so that the data is stored in the "docker area", and not in the folder `dockerlab/webapp/database`.

## 1.8 Optimizing the Docker image

You've probably rebuilt the Docker image a couple of times now. If you look at the output of the `docker images` command, you'll see that the application dependencies are installed every time you rebuild the image. This is not ideal, because the dependencies don't change that often. It would be better to install the dependencies once and then reuse the image.

Your image is probably very big (around 1.2GB), because you might not have used an Alpine version of Node.js. You can use the `docker image ls` command to see the size of your image. The size of the image is important because it's the size of the image that is pulled from the registry and stored on the host system. Check your image's size and write it down in your lab report.

First, change the base image in your `Dockerfile` so that it uses an Alpine version of Node.js. This will reduce the size of the image. Rebuild the image with this Alpine version and check the new image's size and write it down in your lab report.

If you want to inspect all layers of an image, you can use the `docker history` command. This command shows all layers of an image and the size of each layer. The size of the layers is important because it's the size of the layer that is pulled from the registry and stored on the host system. Check the layers of your image and write the output down in your lab report.

Optimizing the order of the commands in the Dockerfile can reduce the image size or the time it takes to (re)build the image. We're going to change the Dockerfile so that the dependencies are installed in a separate layer. Copy the `package.json` and `yarn.lock` files to the container and then run the `yarn install` command. Thereafter, copy the application code to the container.

Rebuild the image, check the new image's size and inspect the layers. Write the new layers down in your lab report. Do you see a difference? If so, what is the difference? Alter something in the JavaScript code and rebuild the image. Do you see a difference in the time it takes to rebuild the image? If so, why is that?

A last optimization is to add a `.dockerignore` file to the folder. This file is similar to the `.gitignore` file and allows you to exclude files from the Docker context (when building an image). Add the `node_modules` folder and all Docker related files to the `.dockerignore` file.

Rebuild and restart your containers using a Docker compose command. Now run the `ls` command inside your container and check that these files are not present in the container: `docker compose exec webapp ls -la`. If so, you've successfully optimized your Docker image.

This image is not so difficult and cannot be optimized that much, but it's a best practice to think about the base image you're using and the layers you're creating. Try to keep the image as small as possible. Docker listed a complete list of best practices for writing Dockerfiles: <https://docs.docker.com/develop/develop-images/dockerfile_best-practices/>.

## 1.9 Testing the application

At last, we want to test the application using integration tests written in [Mocha](https://mochajs.org/). The tests are located in the `dockerlab/webapp/tests/animals.spec.js` file and can be run using the `yarn test` command.

Add a new service to the Docker Compose file to run the tests. Set the environment variable `API_URL` to the URL of the `webapp` service. Notice that you can use the service name as hostname in Docker Compose. Use the `depends_on` option to make sure that the application is started before the tests are run. Re-use the existing Docker image to run the tests, **only** change the command in the `docker-compose.yml` file and **not** in the `Dockerfile`.

To run the tests, start the webapp and database services in the background. If both containers are up and running, run the test container **using a separate Docker compose command**. If you try to start the API and run the tests at the same time, the tests will fail because the API and the database are not ready yet.

If you configured everything correctly, you should see three passing tests. If not, read the error message and try to fix the problem.

## 1.10 Pushing the Docker image to Docker Hub

In a real-world scenario, you would push the Docker image to a Docker registry instead of using your local machine as a repository.

A Docker registry is a repository for Docker images. You can use a public registry like [Docker Hub](https://hub.docker.com/) or a private registry like [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/), [AWS Elastic Container Registry](https://aws.amazon.com/ecr/) or [Google Artifact Registry](https://cloud.google.com/artifact-registry).

We're going to push our `webapp` image to [Docker Hub](https://hub.docker.com/). Sign up or sign in to [Docker Hub](https://hub.docker.com/). Then create a new repository called `webapp`. Make sure it's a **public** repository. It should get a name in the form of `<your-username>/webapp`.

Now that we have a repository, we can push our image to Docker Hub. But first we need to tag our image. You can tag an image using the `docker tag` command. The command should look like this:

```bash
docker tag webapp <your-username>/webapp
```

Sign in to Docker Hub using the `docker login` command, your username and password. Now push the image to Docker Hub using the `docker push` command:

```bash
docker push <your-username>/webapp
```

To test if your image is successfully pushed to Docker Hub, you can remove all images for the webapp from your local machine and then pull it from Docker Hub. Use `docker image rm` to remove all images for the webapp. Use the `docker images` command to check if all images are removed. You should only have Portainer and MySQL images left.

If so, copy your current `docker-compose.yml` to `docker-compose-mysql.yml`. Alter the `docker-compose.yml` file so that it uses the image from Docker Hub instead of building the image locally. You should be able to start **and** test the application using the image from Docker Hub. Make sure to first start the webapp and database services in the background and then run the tests.

## Reflection

This setup oversimplifies the real world. In the real world, you would probably use a managed database service like [Azure Database](https://azure.microsoft.com/en-us/products/mysql) or [Amazon RDS](https://aws.amazon.com/rds/). These services are easier to use, are more robust than a self-hosted database but tend to be expensive. Nevertheless, it's important to know how to run a database in a container. You might need it on your local machine, in a CI/CD pipeline or to reduce costs in a small project.

You would also use a managed CI/CD service like [Jenkins](https://www.jenkins.io/) or [GitHub Actions](https://docs.github.com/en/actions) to run the tests and deploy the application. But more on that in a later module.

However, the setup hands you some best practices for app deployment:

- Use Docker to package your application and its dependencies.
- Don't expose the database port to the outside world.
- Try to re-use a Dockerfile rather than writing one per environment.
- Think about the layers you're creating when writing a Dockerfile.
- Think about backing up your data (even in local environments).

## Possible extensions

- Alter the API setup so that it waits for the database to be ready before starting the API.
- Alter the test setup so that the container waits for the API to be ready before running the tests.
- Set up a service from the [Awesome selfhosted list](https://github.com/awesome-selfhosted/awesome-selfhosted)

## Clean-up

**After demonstrating the results**, you can remove all containers and volumes using the `docker compose down` command with the right options (like `-v` or `-f`). Also make sure all images are removed from your local machine. Which command do you need to use to remove everything?
