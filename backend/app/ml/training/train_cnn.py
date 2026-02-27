import os

# project root directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, Input

DATA_DIR = os.path.join(BASE_DIR, "data/charts/training")
MODEL_PATH = os.path.join(BASE_DIR, "models/cnn/cnn_pattern.keras")

os.makedirs(os.path.join(BASE_DIR, "models/cnn"), exist_ok=True)

IMG_SIZE = (128, 128)
BATCH = 32


print("Loading chart images...")

datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH,
    class_mode="binary",
    subset="training"
)

val = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH,
    class_mode="binary",
    subset="validation"
)


print("\nBuilding CNN model...")

model = Sequential([

    Input(shape=(128,128,3)),

    Conv2D(32,(3,3),activation="relu"),
    MaxPooling2D(),

    Conv2D(64,(3,3),activation="relu"),
    MaxPooling2D(),

    Conv2D(128,(3,3),activation="relu"),
    MaxPooling2D(),

    Flatten(),

    Dense(128,activation="relu"),
    Dropout(0.4),

    Dense(1,activation="sigmoid")

])


model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)


print("\nTraining CNN...")

model.fit(
    train,
    validation_data=val,
    epochs=10
)


model.save(MODEL_PATH)

print("\n✅ CNN model saved at:")
print(MODEL_PATH)