# Lab 6: Hyperparameter tuning

The goal of this assignment is to get familiar with the process of hyperparameter tuning. You will learn how to use the Keras Tuner library to search for the best hyperparameters for a machine learning model.

## :mortar_board: Learning goals

- Get familiar with the Keras Tuner library
- Perform hyperparameter tuning on a neural network
- Use the RandomSearch and Hyperband tuners
- Use different objectives for hyperparameter tuning
- Visualize the hyperparameter tuning process

## :memo: Acceptance criteria

- Show that you have completed the tuning tutorials.
- Provide an answer for all the questions asked.
- Show that you have also edited/added/executed code when asked.
  - Train the model without hyperparameter and show if the results differ with or without hyperparameter tuning.
  - Use the `RootMeanSquaredError` objective and show if the results differ with the `MeanAbsoluteError` objective.
- Show that you wrote an elaborate lab report in Markdown and pushed it to the repository.
- Show that you've executed the notebook and pushed it to the repository.

## 6.1 Hyperparameter tuning

Hyperparameter tuning is the process of finding the best hyperparameters for a model. Hyperparameters are the parameters that are not learned by the model, but are set by the data scientist. Examples of hyperparameters are the learning rate, the number of hidden layers in a neural network, the number of trees in a random forest, etc. The goal of hyperparameter tuning is to find the hyperparameters that give the best performance on a validation set.

[Several techniques](https://keras.io/api/keras_tuner/tuners/) exist for hyperparameter tuning, such as grid search, random search, and Bayesian optimization. In this assignment, you will use the KerasTuner library to perform hyperparameter tuning on a neural network. Specifically, you'll use both the [RandomSearch](https://keras.io/api/keras_tuner/tuners/random/), and the [Hyperband](https://arxiv.org/pdf/1603.06560) tuner which is an optimized version of random search.

### 6.2 Tutorials

For this assignment, you will get familiar with the Keras Tuner library by following the official tutorials.

Upload your finished notebooks to the repository in the folder `resources/06-hyperparameter-tuning`. Make sure you have executed all the code and that the results are visible in the notebook.

You need to complete the following tutorials:

- [Introduction to the Keras Tuner](https://www.tensorflow.org/tutorials/keras/keras_tuner)

  - What is the role of `model_builder()`: how does it differ from building a model manually? What is the function of `hp.Choice()`? What is the difference with `hp.Int()`?
  - Why do we use `tf.keras.callbacks.EarlyStopping()`?
  - Now train the model without hyperparameter tuning using the following parameters:

    - `units`: 512
    - `learning_rate`: 0.005

      Do you see a difference? Which model (with/without hyperparameter tuning) does the best job? How can you prove this?

- [Getting started with Keras Tuner](https://keras.io/guides/keras_tuner/getting_started/)

  - Whats the difference between `max_trials` and `executions_per_trial`?
  - What are the (dis)advantages of using `HyperModel` instead of `build_model()`?
  - Why would you use `hp.get()`?
  - The tutorial uses `MeanAbsoluteError` as objective in chapter "_Specify the tuning Objective_". How can you use `RootMeanSquaredError` instead? Duplicate and edit the code where necessary to try it out. How does it compare (make you sure you have both results stored in the notebook)?
  - You can skip the following chapters:
    - "_Custom metric as the objective_"
    - "_Tune end-to-end workflows_"
    - "_Keep Keras code separate_"
  - When can you use `HyperResNet` and `HyperXception`? What are they?

    > It's possible that you encounter the following error in chapter "_Query the results_": "This model has not yet been built. Build the model first by calling `build()` or by calling the model on a batch of data."
    > The solution is as follows:
    >
    > ```python
    > models = tuner.get_best_models(num_models=2)
    > best_model = models[0]
    > best_model.build(x.shape) # <- this does the trick
    > best_model.summary()
    > ```

- [Visualize the hyperparameter tuning process](https://keras.io/guides/keras_tuner/visualize_tuning/)

  - Provide screenshots of the TensorBoard, especially of the accuracy and loss graphs.

:bulb: Tip: some parts of the notebooks can take a while to execute, be patient and wait until each part has completed successfully.

#### Possible extensions

You can execute the following extra's on the notebook of the first tutorial:

- Hypertune the activation function of the 1st dense layer with `hp.Choice()`
- Determine the optimal number of `Dense` layers you can add to improve the model.
- Explore pre-defined `HyperModel` classes such as `HyperXception` and `HyperResNet` for computer vision applications.
