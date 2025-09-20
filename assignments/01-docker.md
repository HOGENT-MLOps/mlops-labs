# Lab 1: Docker

In this lab, you will learn how to use Docker effectively in MLOps contexts. You'll start with Docker basics for ML model hosting using Flask, then progress to containerization with [NVIDIA Triton Inference Server](https://github.com/triton-inference-server/server) for production-ready model deployment.

## :mortar_board: Learning Goals

### Part 1: Docker Basics in ML Context

- Understanding why Docker is crucial for MLOps (reproducible environments, deployment consistency)
- Building Docker images for ML model hosting with Flask
- Understanding container registry basics (push/pull operations)

### Part 2: Triton Serving

- Understanding NVIDIA Triton Inference Server and its importance in production ML
- Deploying models through Triton containers
- Working with public model repositories (NGC, Hugging Face...)

## :memo: Acceptance criteria

### Part 1: Docker Basics

- Show that you installed Docker and Docker Compose by running the following commands:
  - `docker --version`
  - `docker compose --version`
- Show that you created a Dockerfile to host an ML model using Flask
  - Show that you can build the Docker image using your Dockerfile
  - Show that you can run the Docker container from your image
- Show that you can get an inference from your model using the provided HTTP endpoint
- Show how you push and pull the Docker image to your container registry
- Show that the image exists in your registry

### Part 2: Triton Serving

- Show that you have deployed a TensorFlow model via a Triton container
- Show that you can get an inference from your model using the Triton HTTP endpoint
- Show how you can run a publicly available model of your choice
- Explain the model repository structure and the `config.pbtxt` file

### Part 3: Docker Compose

- Show that you created a `docker-compose.yml` file to orchestrate your services
- Show that you can start, stop, and view logs of your services using Docker Compose

### General

- Show that you wrote an elaborate lab report in Markdown and pushed it to the repository
  - Provide an answer to all questions marked with :question:
  - Include screenshots of key steps and results
- Show that you updated the cheat sheet with the commands you need to remember

---

## Part 1. Docker Basics in ML Context

### 1.1. Why Docker in MLOps?

Docker is essential in MLOps because of:

- **Reproducible environments**: Every developer and production environment uses exactly the same dependencies and configuration
- **Deployment consistency**: Models run identically in development, staging, and production
- **Isolation**: Different models can use different Python/ML library versions
- **Scalability**: Containers can be easily scaled based on load
- **Portability**: Models can be easily moved between cloud providers

:question: **Why is reproducibility crucial in MLOps?** Think about a scenario where your model works perfectly on your laptop but fails in production. What could be the causes?

### 1.2 Lab environment setup

Make sure Docker is installed on your local machine:

- Windows: [Docker Desktop](https://docs.docker.com/desktop/) + WSL2
- macOS: [Docker Desktop](https://docs.docker.com/desktop/)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

Verify the installation:

```bash
docker --version
```

### 1.3 Flask ML model hosting

Before creating the Dockerfile, you need to generate the TensorFlow model that will be used by both the Flask app and Triton server.

#### 1.3.1 Setup the environment

First, we need to install some dependencies. We're not installing the dependencies for the whole system, but only for this project. We can do this by creating a [virtual environment](https://docs.python.org/3/library/venv.html).

This is a **best practice** and it is always advised to install and run python projects this way, instead of installing directly on the host! The following [quote](https://peps.python.org/pep-0405/#motivation) lists the advantages of virtual environments in Python:

> The utility of Python virtual environments has already been well established by the popularity of existing third-party virtual-environment tools, primarily Ian Bicking's virtualenv. Virtual environments are already widely used for dependency management and isolation, ease of installing and using Python packages without system-administrator access, and automated testing of Python software across multiple Python versions, among other uses.
> ~ Carl Meyer

Run the following commands in your terminal:

```bash
cd resources/01-dockerlab
python -m venv venv
```

:question: What does the `python -m venv venv` command do? What is the meaning of the first `venv` argument, and what of the second? Which of the two can you change to your liking?

:question: Make sure your virtual environment is not tracked by Git. How do you do this?

Now activate the virtual environment:

```bash
source venv/bin/activate    # Linux/macOS
venv\Scripts\activate       # Windows (PowerShell)
```

Finally install the required dependencies:

```bash
pip install -r requirements.txt
```

:question: Where are the dependencies installed?

:warning: Make sure to activate the virtual environment in **every** terminal you use for this project. You can deactivate the virtual environment by running the `deactivate` command.

#### 1.3.2 Run the model creation script

Navigate to the `resources/01-dockerlab` folder and run the model creation script:

```bash
python create_tf_model.py
```

Verify the model was created by checking the content of the `model_repository/example_model/1/` folder:

```bash
# Windows (PowerShell):
dir model_repository\example_model\1\

# macOS/Linux:
ls -la model_repository/example_model/1/
```

You should see a `model.savedmodel` directory containing the trained model files.

#### 1.3.3 Create a Dockerfile

In the `resources/01-dockerlab` folder, you will find a simple Flask application (`app.py`) that loads the TensorFlow model and exposes two endpoints:

- `GET /health`: Returns a simple health check response
- `POST /predict`: Accepts JSON input and returns model predictions

Now you need to create your own Dockerfile. Your Dockerfile should:

- [ ] Use a Python 3.12 base image (consider using a slim version for smaller size)
- [ ] Set a working directory inside the container
- [ ] Copy the model
- [ ] Copy the requirements.txt file first (for better layer caching)
- [ ] Install Python dependencies using `pip` (consider using `--no-cache-dir` to reduce image size)
- [ ] Copy your application code (app.py)
- [ ] Expose port 5000
- [ ] Set the command to run your Flask application

Create your `Dockerfile` in the `resources/01-dockerlab` folder.

:question: **Why do we copy `requirements.txt` before copying the application code?** How does this improve Docker layer caching?

:question: **What is the difference between `python:3.12` and `python:3.12-slim`?** What are the trade-offs?

#### 1.3.4 Build and run the container

Finally, build you Docker image:

```bash
docker build -t ml-flask-app .
```

:question: **What does the `-t` flag do in the `docker build` command?** Why is it useful to tag your images?

Then run the container:

```bash
docker run -p 5000:5000 ml-flask-app
```

:question: **What does the `-p 5000:5000` flag do?** What would happen if you used `-p 8080:5000` instead?

:question: **What happens if you try to run the container without the `-p` flag?** Can you still access the API?

:question: **Run `docker images` after building.** What information does this show you about your image?


:question: **Use `docker ps` to see running containers.** What additional information would `docker ps -a` show you?

Test the endpoints using the following commands:

**Windows (PowerShell):**

```bash
Invoke-WebRequest -Uri http://localhost:5000/health

# Windows (PowerShell):
Invoke-WebRequest -Uri "http://localhost:5000/predict" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"features": [1.2, 3.4, 5.6, 7.8]}'
```

**macOS/Linux:**

```bash
curl http://localhost:5000/health

curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [1.2, 3.4, 5.6, 7.8]}'
```

### 1.4 Container registry basics

In a real-world scenario, you would push the Docker image to a Docker registry instead of using your local machine as a repository.

A Docker registry is a repository for Docker images. You can use a public registry like [Docker Hub](https://hub.docker.com/) or a private registry like [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/), [AWS Elastic Container Registry](https://aws.amazon.com/ecr/) or [Google Artifact Registry](https://cloud.google.com/artifact-registry).

We're going to push our `ml-flask-app` image to [Docker Hub](https://hub.docker.com/). Sign up or sign in to [Docker Hub](https://hub.docker.com/). Then create a new repository called `ml-flask-app`. Make sure it's a **public** repository. It should get a name in the form of `<your-username>/ml-flask-app`.

Now that we have a repository, we can push our image to Docker Hub. But first we need to tag our image. You can tag an image using the `docker tag` command. The command should look like this:

```bash
docker tag ml-flask-app <your-username>/ml-flask-app:0.0.1
```

Sign in to Docker Hub using the `docker login` command, your username and password. Now push the image to Docker Hub using the `docker push` command:

```bash
docker push <your-username>/ml-flask-app:0.0.1
```

Verify the image was pushed by visiting your repository on Docker Hub.

Remove the local image using the `docker image rm` command:

```bash
docker image rm <your-username>/ml-flask-app:0.0.1
```

Now try to pull the image from Docker Hub using the `docker pull` command:

```bash
docker pull <your-username>/ml-flask-app:0.0.1
```

:question: **What is the purpose of tagging an image before pushing?** What naming conventions should you follow for production images?

:question: **What are the benefits of using container registries?** How do they fit into a CI/CD pipeline?

---

## Part 2. Triton Serving

NVIDIA Triton Inference Server is an open-source inference server that is used for production deployments, it supports multiple frameworks such as TensorFlow, PyTorch, ONNX, scikit-learn, etc..

**Note**: The GPU acceleration features work optimally with NVIDIA GPUs. While Triton can run on CPU-only systems, students with AMD GPUs may not have access to the full GPU acceleration capabilities that NVIDIA provides.

It has following benefits:

- **Scalability**: Can serve multiple models simultaneously
- **Performance**: Optimized for GPU and CPU inference
- **Flexibility**: Supports different model formats
- **Monitoring**: Extensive metrics and health checks

### 2.1 Model repository

Make sure you have the following folder structure in the `resources/01-dockerlab` folder:

```text
model_repository/
└── example_model/
    └── 1/
        └── model.savedmodel/
```


:question: **Why is the model stored in a folder named `1`?** What does this number represent?

Create a `config.pbtxt` file in the `model_repository/example_model` folder with the following content:

```protobuf
name: "example_model"
platform: "tensorflow_savedmodel"
max_batch_size: 8
input [
  {
    name: "keras_tensor"
    data_type: TYPE_FP32
    dims: [4]
  }
]
output [
  {
    name: "output_0"
    data_type: TYPE_FP32
    dims: [1]
  }
]
```

:question: **What is the purpose of the `config.pbtxt` file?** Why is it essential for Triton to understand how to serve your model?
:question: **Analyze the config.pbtxt file.** What does each field represent?

### 2.2 Run the Triton server

Run the Triton server using the official image with volume mounting. Make sure you execute the command from the `resources/01-dockerlab` folder.

**Windows:**

```powershell
docker run --gpus all -p 8000:8000 -p 8001:8001 -p 8002:8002 `
  -v ${PWD}/model_repository:/models `
  nvcr.io/nvidia/tritonserver:23.10-py3 `
  tritonserver --model-repository=/models
```

**macOS/Linux:**

```bash
docker run --gpus all -p 8000:8000 -p 8001:8001 -p 8002:8002 \
  -v $(pwd)/model_repository:/models \
  nvcr.io/nvidia/tritonserver:23.10-py3 \
  tritonserver --model-repository=/models
```

:question: **What is the purpose of the volume mapping (`-v` option)?**

### 2.3 Test Triton endpoints

Check the model status endpoint to verify the model is loaded:

**Windows (PowerShell):**

```powershell
Invoke-WebRequest http://localhost:8000/v2/models/example_model
```

**macOS/Linux:**

```bash
curl http://localhost:8000/v2/models/example_model
```

:question: **What information does the model status endpoint provide?** How can you use this to debug model loading issues?

Try the inference endpoint:

**Windows (PowerShell):**

```powershell
Invoke-WebRequest http://localhost:8000/v2/models/example_model/infer `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "inputs": [
      {
        "name": "keras_tensor",
        "shape": [1, 4],
        "datatype": "FP32",
        "data": [[1.2, 3.4, 5.6, 7.8]]
      }
    ]
  }'
```

**macOS/Linux:**

```bash
curl -X POST http://localhost:8000/v2/models/example_model/infer \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [
      {
        "name": "keras_tensor",
        "shape": [1, 4],
        "datatype": "FP32",
        "data": [[1.2, 3.4, 5.6, 7.8]]
      }
    ]
  }'
```

:question: **Test the inference endpoint and analyze the response.** What format does the output take? How does it differ from the Flask API response?

:question: Triton also supports gRPC **What is the difference between HTTP and gRPC for model inference?** When would you choose one over the other?

### 2.4 Hosting public models

Triton allows you to serve multiple models simultaneously. Add a publicly available model to demonstrate this capability.

Choose a model from public repository, you can find many models at:

- <https://catalog.ngc.nvidia.com/models>
- <https://tfhub.dev/>
- <https://huggingface.co/models>

**What to look for:**

- Choose a model that's compatible with Triton (ONNX, TensorRT, or TensorFlow SavedModel format)
- Look for models with clear documentation and download instructions
- Consider model size - smaller models will download and load faster for this exercise
- Popular categories include image classification, object detection, or text processing models

**Getting started:**

1. Browse the model repositories above to find something interesting
2. Check the model's documentation for download links and format requirements
3. Download the model files to your local machine
4. Create a new model directory in your Triton model repository
5. Copy the model files and create a `config.pbtxt` file for the new model
6. Restart your Triton container to load the new model

---

## Part 3. Docker Compose

A docker run command can become quite long when you need to specify all the options. Luckily, there's a tool called Docker Compose that allows you to define a multi-container application in a single file. Docker Compose is already installed for those who use Docker Desktop. If you're using Docker Engine, you need to install Docker Compose separately using the instructions on the Docker website.

Docker Compose uses YAML files to configure your application's services, networks, and volumes, making it much easier to manage complex applications with multiple containers.

⚠️ Docker Compose is now a plugin and should be used as `docker compose` and not `docker-compose`.

### 3.1 Creating a docker-compose.yml

Create a `docker-compose.yml` file in the `resources/01-dockerlab` folder to define a service called `ml-flask-app` and a service called `triton-server`.

💡 It's a good idea to use the `build` option when you're still changing the Docker image. This way, Docker Compose will automatically rebuild the image when you start the container.

**For the `ml-flask-app` service:**

- [ ] Use `build: .` to build from your Dockerfile
- [ ] Map port 5000 from container to host

**For the `triton-server` service:**

- [ ] Use the Triton image: `nvcr.io/nvidia/tritonserver:23.10-py3`
- [ ] Map ports 8000, 8001, and 8002
- [ ] Mount the model_repository volume to `/models`
- [ ] Set the command to start Triton with the model repository

Start both services in the background:

```bash
docker compose up -d
```

View the running services:

```bash
docker compose ps
```

:question: **How can you view the logs of the services?**

:question: **What does the `-d` flag do in `docker compose up -d`?** When would you use it vs. not using it?

:question: **How would you stop the services?** What command would you use to stop and remove all containers, networks, and volumes defined in the `docker-compose.yml` file?

## Reflection

This lab has taught you:

- **Docker basics** for ML model hosting with Flask
- **Triton Inference Server** for production-ready model serving
- **Container registry** best practices
- **Public model repositories** integration
- **Docker Compose** for multi-container orchestration

## Clean-up

After you've demonstrated your solution, you can stop and remove all containers.

To clean up your Docker environment by removing all unused images and volumes, run:

```bash
# Remove all images
docker image prune -a

# Remove all volumes
docker volume prune
```
