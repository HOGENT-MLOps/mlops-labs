# Lab 3: The ML Workflow

## :mortar_board: Learning goals

- Create a simple ML workflow with Azure ML
- Deploy a model to an Azure managed endpoint

## :memo: Acceptance criteria

<!-- These criteria are checked: -->

- Show that you've executed the notebook and pushed it to the repository
  - Show that your Jupyter notebook contains all cells' output
- Show that you created a virtual environment for the project
- Show the Prefect and MLFlow dashboards
- Show that your ML pipeline is working
- Show the logs and metrics in the MLFlow dashboard
- Show that you pushed a model to MLFlow
- Show that you wrote an elaborate lab report in Markdown and pushed it to the repository
  - Show that it contains the answers to the questions in the lab assignment
  - Show that it contains the screenshots of the MLFlow dashboard

<!-- TODO: update criteria -->

- Show that you are able to make a prediction with the deployed model

## 1. The scenario

The typical machine learning (ML) workflow begins within a Jupyter notebook where data scientists and analysts prototype and experiment with ML models. In the notebook, they perform essential tasks such as data preprocessing, exploratory data analysis (EDA), feature engineering, model selection, training, and evaluation. Once a promising model is developed and tested locally, the transition to MLOps (Machine Learning Operations) is crucial.

For this lab assignment, you get a Jupyter notebook which contains a very simple ML model to classify images of apples and oranges. It's your job to create an ML pipeline using [Prefect](https://www.prefect.io/).

There are many providers of tools for creating ML pipelines. This lab assignment deliberately uses Prefect, a Python-based workflow automation tool. Prefect is a modern workflow orchestration tool that is easy to use and has a lot of features. It is a good choice for creating ML pipelines and you should be able to translate the concepts you learn here to other tools like Kubeflow, Azure ML Pipelines, etc. Prefect is also a nice tool for testing ML pipelines locally, without the need for a cloud provider.

## 2. The notebook

Before diving into the ML pipeline, try to execute the notebook first. This will give you an idea of what the notebook does and how the ML model is trained.

## 2.1. Run the notebook

Open the notebook `resources/03-ml-workflow/ml_workflow.ipynb` in [Google Colab](https://colab.research.google.com/). Choose to upload a notebook and upload the `ml_workflow.ipynb` notebook from the `resources/03-ml-workflow` folder.

![Upload notebook](./img/03-ml-workflow/upload-notebook.png)

You can also run the notebook locally if you have the required dependencies installed.

## 2.2. Download the notebook

When you're finished with the lab, you can download the notebook by clicking on `File > Download > Download .ipynb` in the menu bar. Overwrite the original `ml_workflow.ipynb` notebook in the `resources/03-ml-workflow` folder with your downloaded notebook. The notebook should contain all cells' output. Commit and push the changes to your GitHub repository.

## 3. The ML pipeline

Now that you have a basic understanding of the ML model, it's time to create an ML pipeline.

## 3.1. Setup the environment

First, we need to install some dependencies. We're not installing the dependencies for the whole system, but only for this project. We can do this by creating a [virtual environment](https://docs.python.org/3/library/venv.html).

This is a **best practice** and it is always advised to install and run python projects this way, instead of installing directly on the host! The following [quote](https://peps.python.org/pep-0405/#motivation) lists the advantages of virtual environments in Python:

> The utility of Python virtual environments has already been well established by the popularity of existing third-party virtual-environment tools, primarily Ian Bicking's virtualenv. Virtual environments are already widely used for dependency management and isolation, ease of installing and using Python packages without system-administrator access, and automated testing of Python software across multiple Python versions, among other uses.  
> ~ Carl Meyer

Run the following commands in your terminal:

```bash
cd resources/03-ml-workflow
python3 -m venv venv
```

:question: What does the `python3 -m venv venv` command do? What is the meaning of the first `venv` argument, and what of the second? Which of the two can you change to your liking?

:question: Make sure your virtual environment is not tracked by Git. How do you do this?

Now activate the virtual environment:

```bash
source venv/bin/activate    # Linux/macOS
venv\Scripts\activate.bat   # Windows
```

Finally install the required dependencies:

```bash
pip install -r requirements.txt
```

:question: Where are the dependencies installed?

## 3.2. Start the Prefect server

Before we can develop the pipeline, we need to start the Prefect server. The Prefect server is a web application that provides a dashboard for monitoring and managing your workflows. Run the following command:

```bash
export PREFECT_HOME=$(pwd)/prefect_home              # <- Linux/macOS
$Env:PREFECT_HOME = "$(Get-Location)/prefect_home"   # <- Windows

prefect server start
```

Open the Prefect server in your browser by navigating to `http://localhost:8080`. You should see the Prefect dashboard.

:question: Why do we need to set the `PREFECT_HOME` environment variable?

## 3.3. Create the pipeline

Now it's time to create the pipeline. Create a new file `ml_workflow.py` in the `resources/03-ml-workflow` folder. Open the file in your favorite code editor. We'll define the pipeline using Prefect's Python API.

The pipeline should contain the following steps:

1. **Download data:** Download all images from our GitHub repository.
   - Input: nothing
   - Output: nothing
2. **Preprocess data:** Preprocess the images and split them into training, validation and test sets.
   - Input: nothing
   - Output: training, validation and test dataset generators
3. **Train the model:** Train the model on the training set.
   - Input: training & validation dataset generator
   - Output: model file name
4. **Evaluate the model:** Evaluate the model on the test set.
   - Input: model file name + test dataset generator
   - Output: nothing

Each of these steps should be a separate `task` in the pipeline. The tasks should be connected in the correct order using a `flow`.

Write your pipeline file named `ml_workflow.py` in the folder `resources/03-ml-workflow`. Use the following documentation to help you create the pipeline:

- [Write and run tasks](https://docs.prefect.io/3.0/develop/write-tasks)
- [Write and run flows](https://docs.prefect.io/3.0/develop/write-flows)

Create the pipeline in little steps. Do **not** create the entire pipeline at once without running it. This will make debugging much harder. Instead, create the first task, run it, then create the second task, run it, etc.

Make sure to set constants at the top of your script! This way, you can easily change the values of these constants without having to search through your entire script.

## 4. MLFlow

Now we're going to integrate [MLFlow](https://mlflow.org/) in our pipeline. MLFlow is an open-source platform for managing the end-to-end machine learning lifecycle. It's a great tool for tracking experiments, packaging code into reproducible runs, and sharing and deploying models.

MLFlow was already installed when you installed the dependencies. You can start the MLFlow server by running the following command in a separate terminal:

```bash
mlflow server
```

Open the MLFlow server in your browser by navigating to `http://localhost:5000`. You should see the MLFlow dashboard.

Go to your Prefect flow and set the MLFlow tracking URI and the experiment name. Use global variables on top of your script to set these values.

MLFlow is also able to log [system metrics](https://mlflow.org/docs/latest/system-metrics/index.html). `psutil` was already installed when you installed the dependencies. Configure MLFlow to log system metrics by setting the [`MLFLOW_ENABLE_SYSTEM_METRICS_LOGGING`](https://mlflow.org/docs/latest/system-metrics/index.html#using-the-environment-variable-to-control-system-metrics-logging) environment variable to `true`.

Now enable the following logs:

1. Autologging in your train task.
2. Autologging in your evaluate task.
3. Log the number of epochs and the batch size in your train task.
4. Log your model weights as an artifact in your train task.

Run your pipeline and check if the logs and metrics are visible in the MLFlow dashboard.

Add some screenshots of the graphs, metrics, and artifacts to your lab report.

## Possible extensions

- Can you make the basic model above better? Note that better doesn't just mean scoring higher on this dataset. It means that the model is more robust and can generalize better to unseen data. You could try one or more of the following:
  - Create a better dataset
  - Add more layers
  - Use transfer learning
  - Use hyperparameter turning
  - Data augmentation
  - ...
- Can you modify the components/pipeline so that you can choose the amount of epochs the model trains for?
- ...
