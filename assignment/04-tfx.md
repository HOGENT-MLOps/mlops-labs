# Lab 4: TensorFlow Extended (TFX)

The goal of this lab is to learn how to use [TensorFlow Extended (TFX)](https://www.tensorflow.org/tfx) to create a machine learning pipeline. TFX pipelines will be used throughout the entire course to train and deploy machine learning models.

## :mortar_board: Learning goals

- Understanding the concept of ML pipelines
- Understanding the components of TensorFlow Extended
- Understanding the basic architecture of ML metadata stores
- Being able to create an ML pipeline
- Being able to manipulate TFX components
  - ExampleGen, SchemaGen, StatisticsGen, ExampleValidator
  - Transform, Trainer, Evaluator, Pusher
- Being able to interpret the outputs of an ML pipeline

## :memo: Acceptance criteria

> TODO: add acceptance criteria

- Show your lab notes and cheat sheet with useful code snippets

## TFX tutorials

As with every new technology, the best way to get started is to follow the tutorials provided by the creators. In this lab, you will first follow the [TFX Getting started tutorials](https://www.tensorflow.org/tfx/tutorials) to learn how to create a TFX pipeline.

The TFX pipelines will generate lots of metadata and files in your working directory on Google Colab. Make sure to check out what these files are and what they do by exploring the directory structure in Google Colab and reading documentation.

So, there are 4 tutorials which you need to follow:

1. Starter pipeline
2. Adding Data Validation
3. Adding Feature Engineering
4. Adding Model Analysis

Go to <https://www.tensorflow.org/tfx/tutorials> and follow these tutorials in order. It's recommended to use Google Colab to run the tutorials. When you're done with a tutorial, **download the notebook and upload it to your GitHub repository** in a directory named `tflab`. This serves as proof that you completed it.

> Don't follow the tutorial blindly, make sure to understand what you're doing and why you're doing it. If you don't understand something, read some documentation, search on Google, or ask for help.

At the moment of writing the lab assignment, the tutorials suffer from incompatibility issues with Python 3.10 (default Python version in Google Colab).

:exclamation: Notice the big red box at the top of the tutorials page with the temporary workaround. Make sure to check if you followed the instructions correctly when you encounter errors installing TFX before asking for help.

You can check this issue for the current status of the compatibility issues: <https://github.com/tensorflow/tfx/issues/5897>. If the issue seems fixed, you can try to run the tutorials with Python 3.10 without the workaround.

## Possible extensions

There are a number of possible extensions you can do if you have time left. Make sure not to follow tutorials talking about serving models, this will be covered in a next lab.

- Experiment with every component in the TFX pipeline: [Complete Pipeline Tutorial](https://www.tensorflow.org/tfx/tutorials/tfx/components_keras)
- Create a custom component: [Custom Component Tutorial](https://www.tensorflow.org/tfx/tutorials/tfx/python_function_component)
- Learn more about [Data Validation](https://www.tensorflow.org/tfx/tutorials/data_validation/tfdv_basic)
- Learn more about [Model Analysis](https://www.tensorflow.org/tfx/tutorials/model_analysis/tfma_basic)
