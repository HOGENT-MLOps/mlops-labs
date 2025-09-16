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