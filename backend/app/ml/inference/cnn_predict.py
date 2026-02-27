import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# project root directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

MODEL_PATH = os.path.join(BASE_DIR, "models/cnn/cnn_pattern.keras")

IMG_SIZE = (128,128)

model = load_model(MODEL_PATH)


def predict_chart(img_path):

    img = image.load_img(img_path, target_size=IMG_SIZE)

    img = image.img_to_array(img)

    img = img / 255.0

    img = np.expand_dims(img, axis=0)

    prob = model.predict(img, verbose=0)[0][0]

    label = "bullish" if prob > 0.5 else "bearish"

    confidence = float(prob)

    return label, confidence