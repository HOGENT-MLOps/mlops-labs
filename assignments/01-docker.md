# Lab 1: Docker revisited

In this lab assignment, you will learn how to use Docker effectively in MLOps contexts. You'll start with Docker basics for ML model hosting using Flask, then progress to containerization with [NVIDIA Triton Inference Server](https://github.com/triton-inference-server/server) for production-ready model deployment.

## :mortar_board: Learning Goals

### Part 1: Docker Basics in ML Context
- Understanding why Docker is crucial for MLOps (reproducible environments, deployment consistency)
- Building Docker images for ML model hosting with Flask
- Understanding container registry basics (push/pull operations)

### Part 2: Triton Serving
- Understanding NVIDIA Triton Inference Server and its importance in production ML
- Deploying models through Triton containers
- Working with public model repositories (NGC, Hugging Face)

## :memo: Acceptance criteria

### Part 1: Docker Basics
- Show Docker installation: `docker --version` and `docker compose --version`
- Show the Dockerfile for a Flask ML model hosting application
- Demonstrate how to build and run a custom docker container
- Demonstrate model inference via HTTP endpoints
- Push the Docker image to a container registry
- Show the image exists in your registry

### Part 2: Triton Serving
- Deploy a TensorFlow model via Triton container
- Demonstrate model inference via Triton HTTP endpoints
- Demonstrate how you ran a publicly available model of your choice
- Explain the model repository structure and config.pbtxt

### Part 3: Docker Compose & Portainer
- Create a docker-compose.yml file to orchestrate your services
- Use Portainer to manage your Docker containers through a web interface
- Show how to start, stop, and monitor containers using Portainer

### General
- Show that you wrote an elaborate lab report in Markdown
- Provide answers to all questions marked with :question:
- Update the cheat sheet with essential Docker commands
- Include screenshots of key steps and results

---

# Part 1: Docker Basics in ML Context

## 1.1 Why Docker in MLOps?

Docker is essential in MLOps because of:

- **Reproducible environments**: Every developer and production environment uses exactly the same dependencies and configuration
- **Deployment consistency**: Models run identically in development, staging, and production
- **Isolation**: Different models can use different Python/ML library versions
- **Scalability**: Containers can be easily scaled based on load
- **Portability**: Models can be easily moved between cloud providers

:question: **Why is reproducibility crucial in MLOps?** Think about a scenario where your model works perfectly on your laptop but fails in production. What could be the causes?


## 1.2 Lab Environment Setup

Make sure Docker is installed on your local machine:

- Windows: [Docker Desktop](https://docs.docker.com/desktop/) + WSL2
- macOS: [Docker Desktop](https://docs.docker.com/desktop/)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

Verify the installation:
```bash
docker --version
```

## 1.3 Hands-on: Flask ML Model Hosting

### Step 1: Create a simple ML model

Create a new folder `ml-flask-app` and create the following files:

**requirements.txt:**
```
flask==3.0.0
scikit-learn==1.3.2
numpy==1.24.3
pandas==2.1.4
tensorflow==2.13.0
```

**create_tf_model.py:**
```python
import tensorflow as tf
import numpy as np
from sklearn.datasets import make_classification

# Generate some sample data
X, y = make_classification(n_samples=1000, n_features=4, n_classes=2, random_state=42)

# Create a simple TensorFlow model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(8, activation='relu', input_shape=(4,)),
    tf.keras.layers.Dense(4, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(X, y, epochs=10, batch_size=32, validation_split=0.2, verbose=1)

# Save the model in SavedModel format for Triton
model.export('model_repository/example_model/1/model.savedmodel', format='tf_saved_model')

print("TensorFlow model created and saved successfully!")
print(f"Model summary:")
model.summary()

# Test the model
test_input = np.array([[1.0, 2.0, 3.0, 4.0]])
prediction = model.predict(test_input)
print(f"Test prediction for [1.0, 2.0, 3.0, 4.0]: {prediction[0][0]:.4f}")
```

**app.py:**
```python
from flask import Flask, request, jsonify
import numpy as np  
import tensorflow as tf

app = Flask(__name__)

# Load the TensorFlow model using TFSMLayer (Keras 3 approach for SavedModel)
model_path = 'model_repository/example_model/1/model.savedmodel'
tf_model = tf.keras.layers.TFSMLayer(model_path, call_endpoint='serve')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model_loaded": True})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        features = np.array(data['features'], dtype=np.float32).reshape(1, -1)
        
        prediction = tf_model(features)
        prediction_value = prediction.numpy()[0][0]
        
        predicted_class = 1 if prediction_value > 0.5 else 0
        confidence = max(prediction_value, 1 - prediction_value)
        
        return jsonify({
            "prediction": int(predicted_class),
            "confidence": float(confidence),
            "raw_output": float(prediction_value)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### Step 2: Create a Dockerfile


**Dockerfile:**
```dockerfile
# Use Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
```

:question: **Why do we copy `requirements.txt` before copying the application code?** How does this improve Docker layer caching?

:question: **What is the difference between `python:3.9` and `python:3.9-slim`?** What are the trade-offs?


### Step 3: Build and run the container

```bash
# Build the image
docker build -t ml-flask-app .

# Run the container
docker run -p 5000:5000 ml-flask-app

# Test the API
curl http://localhost:5000/health
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [1.2, 3.4, 5.6, 7.8]}'
```

:question: **What does the `-p 5000:5000` flag do?** What would happen if you used `-p 8080:5000` instead?

:question: **Run `docker images` after building.** What information does this show you about your image?

:question: **What happens if you try to run the container without the `-p` flag?** Can you still access the API?

:question: **Use `docker ps` to see running containers.** What additional information would `docker ps -a` show you?


## 1.4 Container Registry Basics

### Docker Hub Push/Pull

```bash
# Tag your image
docker tag ml-flask-app <your-username>/ml-flask-app:0.0.1

# Login to Docker Hub
docker login

# Push to registry
docker push <your-username>/ml-flask-app:0.0.1

# Pull from registry (on another machine)
docker pull <your-username>/ml-flask-app:0.0.1
```

:question: **What is the purpose of tagging an image before pushing?** What naming conventions should you follow for production images?

:question: **What are the benefits of using container registries?** How do they fit into a CI/CD pipeline?


---

# Part 2: Triton Serving

## Introduction to Triton Inference Server

NVIDIA Triton Inference Server is an open-source inference server that is used for production deployments, it supports multiple frameworks such as TensorFlow, PyTorch, ONNX, scikit-learn, etc..

It has following benefits:

- **Scalability**: Can serve multiple models simultaneously
- **Performance**: Optimized for GPU and CPU inference
- **Flexibility**: Supports different model formats
- **Monitoring**: Extensive metrics and health checks

### Step 1: Model repository

Create the following folder structure:

```
model_repository/
└── model/
    ├── config.pbtxt
    └── 1/
        └── model.savedmodel/
```

:question: **What is the purpose of the `config.pbtxt` file?** Why is it essential for Triton to understand how to serve your model?

:question: **Why is the model stored in a folder named `1`?** What does this number represent?


**config.pbtxt:**
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

:question: **Analyze the config.pbtxt file.** What does each field represent? How does it differ from the scikit-learn configuration?


**Copy the trained TensorFlow model from the Flask lab to the model repository:**

First, run the model creation script to generate the SavedModel:
```bash
python create_tf_model.py
```

This will create the model in the correct format for Triton serving.

### Step 2: Test the model locally

Before deploying to Triton, you can test the model locally using the Flask app:

```bash
# Run the Flask app
python app.py

# Test the health endpoint
curl http://localhost:5000/health

# Test prediction
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [1.2, 3.4, 5.6, 7.8]}'
```

:question: **What does the Flask API response look like?** How does it differ from the raw TensorFlow model output?

## Run the Triton server

Run the Triton server using the official image with volume mounting:

```bash
# Run Triton server with volume mapping
docker run --gpus all -p 8000:8000 -p 8001:8001 -p 8002:8002 \
  -v $(pwd)/model_repository:/models \
  nvcr.io/nvidia/tritonserver:23.10-py3 \
  tritonserver --model-repository=/models
```

:question: **What is the purpose of the volume mapping `-v $(pwd)/model_repository:/models`?**



### Step 2: Test Triton Endpoints

**Model Status:**
```bash
curl http://localhost:8000/v2/models/example_model
```

:question: **What information does the model status endpoint provide?** How can you use this to debug model loading issues?

**Inference (HTTP):**
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

:question: Tirton also supports gRPC **What is the difference between HTTP and gRPC for model inference?** When would you choose one over the other?


### Hosting public models

Triton allows you to serve multiple models simultaneously. Add a publicly available model to demonstrate this capability.

**Step 1: Choose a Public Model**

You can find many models at:
- https://catalog.ngc.nvidia.com/models
- https://tfhub.dev/
- https://huggingface.co/models

---

# Part 3: Docker Compose & Portainer

## 3.1 Create a Docker Compose file

A docker run command can become quite long when you need to specify all the options. Luckily, there's a tool called Docker Compose that allows you to define a multi-container application in a single file. Docker Compose is already installed for those who use Docker Desktop. If you're using Docker Engine, you need to install Docker Compose separately using the instructions on the Docker website.

Docker Compose is a tool for defining and running multi-container Docker applications. It uses YAML files to configure your application's services, networks, and volumes, making it much easier to manage complex applications with multiple containers.

⚠️ **Docker Compose is now a plugin and should be used as `docker compose` and not `docker-compose`.**

Create a `docker-compose.yml` file in the `resources/01-dockerlab` folder to define a service called `ml-flask-app` and a service called 'triton-server'.

💡 **It's a good idea to use the build option when you're still changing the Docker image. This way, Docker Compose will automatically rebuild the image when you start the container.**

Make sure to start the services in the background.



## 3.2 Creating a Docker Compose Setup

### Step 1: Create docker-compose.yml

Create a `docker-compose.yml` file that includes:
- Your Flask ML application
- Triton Inference Server


### Step 2: Run with Docker Compose

```bash
# Start all services
docker compose up -d

# View running services
docker compose ps

# View logs
docker compose logs

# Stop all services
docker compose down
```

:question: **What does the `-d` flag do in `docker compose up -d`?** When would you use it vs. not using it?

## 3.3 Portainer for Container Management

It's possible to manage Docker containers using the command line, but it's sometimes easier to quickly use a graphical user interface.

For this lab assignment, we'll be using Portainer, a web-based GUI for managing Docker containers. You'll find a file `docker-compose.portainer.yml` in the folder `resources/01-dockerlab`. This file contains the configuration to run a Portainer container.

### Step 1: Start Portainer

```bash
# Navigate to the resources/01-dockerlab directory
cd resources/01-dockerlab

# Start Portainer using the provided compose file
docker compose -f docker-compose.portainer.yml up -d
```

### Step 2: Access Portainer

1. Open your browser and navigate to `https://localhost:9443`
2. Ignore the warning about HTTPS and create an admin user
3. You can use the default settings for the other options
4. Select "Docker" as the environment

💡 **If you've waited too long before creating an admin user, Portainer will show a timeout error. You can fix this by restarting the container:**
```bash
docker compose -f docker-compose.portainer.yml restart
```

## Reflection

This lab has taught you:

- **Docker basics** for ML model hosting with Flask
- **Triton Inference Server** for production-ready model serving
- **Container registry** best practices
- **Public model repositories** integration
- **Docker Compose** for multi-container orchestration
- **Portainer** for container management


## Clean-up

```bash
# Remove all images
docker image prune -a

# Remove all volumes
docker volume prune
```
