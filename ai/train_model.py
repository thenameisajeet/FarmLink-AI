import pandas as pd
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error


DATA_FILE = "Agriculture_price_dataset.csv"
MODEL_FILE = "demand_model.pkl"


# 1. Load dataset
print("Loading dataset...")
df = pd.read_csv(DATA_FILE)

# 2. Convert date
df["Price Date"] = pd.to_datetime(df["Price Date"])

# 3. Sort historical records
df = df.sort_values(
    ["Commodity", "STATE", "District Name", "Market Name", "Price Date"]
)

# 4. Create time features
df["year"] = df["Price Date"].dt.year
df["month"] = df["Price Date"].dt.month
df["day_of_year"] = df["Price Date"].dt.dayofyear

# 5. Create historical price features
group = df.groupby(
    ["Commodity", "STATE", "District Name", "Market Name"]
)["Modal_Price"]

df["previous_price"] = group.shift(1)
df["price_7_days_ago"] = group.shift(7)
df["price_30_days_ago"] = group.shift(30)

# 6. Target = next observed market price
df["future_price"] = group.shift(-1)

# Remove rows without enough history
df = df.dropna(
    subset=[
        "previous_price",
        "price_7_days_ago",
        "price_30_days_ago",
        "future_price"
    ]
)

print(f"Training rows available: {len(df):,}")


# 7. Features
features = [
    "Commodity",
    "STATE",
    "District Name",
    "Market Name",
    "year",
    "month",
    "day_of_year",
    "Min_Price",
    "Max_Price",
    "Modal_Price",
    "previous_price",
    "price_7_days_ago",
    "price_30_days_ago"
]

X = df[features]
y = df["future_price"]


# 8. Time-based train/test split
split = int(len(df) * 0.8)

X_train = X.iloc[:split]
X_test = X.iloc[split:]

y_train = y.iloc[:split]
y_test = y.iloc[split:]

print(f"Training set: {len(X_train):,} rows")
print(f"Testing set:  {len(X_test):,} rows")


# 9. Categorical + numerical processing
categorical = [
    "Commodity",
    "STATE",
    "District Name",
    "Market Name"
]

numeric = [
    "year",
    "month",
    "day_of_year",
    "Min_Price",
    "Max_Price",
    "Modal_Price",
    "previous_price",
    "price_7_days_ago",
    "price_30_days_ago"
]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OrdinalEncoder(
                handle_unknown="use_encoded_value",
                unknown_value=-1
            ),
            categorical
        ),
        (
            "numeric",
            "passthrough",
            numeric
        )
    ]
)


# 10. Genuine ML model
model = RandomForestRegressor(
    n_estimators=60,
    max_depth=18,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)


pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# 11. Train
print("\nTraining AI/ML model...")
pipeline.fit(X_train, y_train)


# 12. Test
print("Testing model...")

predictions = pipeline.predict(X_test)

mae = mean_absolute_error(y_test, predictions)


# 13. Results
print("\n================================")
print("MODEL TRAINED SUCCESSFULLY")
print("================================")
print(f"Test MAE: {mae:.2f}")


# 14. Save trained model
joblib.dump(pipeline, MODEL_FILE)

print(f"Saved model: {MODEL_FILE}")