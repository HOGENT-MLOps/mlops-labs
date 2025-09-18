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
print("Model summary:")
model.summary()

# Test the model
test_input = np.array([[1.0, 2.0, 3.0, 4.0]])
prediction = model.predict(test_input)
print(f"Test prediction for [1.0, 2.0, 3.0, 4.0]: {prediction[0][0]:.4f}")
