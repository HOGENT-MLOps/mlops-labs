# Lab 5: Quantization and pruning

The goal of this assignment is to get familiar with the TensorFlow Lite framework, a framework for running machine learning models on edge devices. You will learn how to convert a TensorFlow model to a TensorFlow Lite model and how to use the TensorFlow Lite interpreter to run inference on the model. You will also learn how to use the TensorFlow Lite converter to quantize and prune a model.

## :mortar_board: Learning goals

- Get familiar with the TensorFlow Lite framework
- Convert a TensorFlow model to a TensorFlow Lite model with quantization
- Train a quantize aware model
- Perform weight pruning on a model

## :memo: Acceptance criteria

- Show that you can convert a TensorFlow model to a TensorFlow Lite model with quantization
- Show that you can train a quantize aware model
- Show that you can perform weight pruning on a model
- Show that your Jupyter notebook contains all cells' output
- Show that you understand quantization and pruning (in your own words):
  - Explain quantization and pruning
  - Explain the difference between post-training quantization and quantization aware training
  - Explain the difference between weight pruning and quantization
- Show that you wrote an elaborate lab report in Markdown and pushed it to the repository
- Show that you've executed the notebook and pushed it to the repository

## 1. Open the notebook

This lab is written in a Jupyter notebook named `quantization-and-pruning.ipynb`, which you can find in the `ml-workflow` folder. Go to <https://colab.research.google.com/> and sign in with your Google account if needed. Choose to upload a notebook and upload the `quantization-and-pruning.ipynb` notebook from the `ml-workflow` folder.

![Upload notebook](./img/05-quantization-and-pruning/upload-notebook.png)

## 2. Follow the instructions in the notebook

From now on, you can follow the instructions in the notebook. You can run the code in the notebook by clicking on the play button next to the code block. Some cells contain a `# TODO:` comment. You should fill in the missing information before running the code cell.

**Important!** Make sure you understand all the code that is written for you in the notebook. So don't just run the code, but read it and try to understand it. If you don't understand it, search for information on the Internet.

## Possible extensions

The notebook contains some possible extensions at the very end. You can try to implement them to get a more profound understanding of TensorFlow Lite.
