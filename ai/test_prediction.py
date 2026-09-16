import pandas as pd
import joblib


DATA_FILE = "Agriculture_price_dataset.csv"
MODEL_FILE = "demand_model.pkl"


print("Loading trained model...")
model = joblib.load(MODEL_FILE)

print("Loading agricultural data...")
df = pd.read_csv(DATA_FILE)

df["Price Date"] = pd.to_datetime(df["Price Date"])

df = df.sort_values(
    ["Commodity", "STATE", "District Name", "Market Name", "Price Date"]
)

# Create the same features used during training
df["year"] = df["Price Date"].dt.year
df["month"] = df["Price Date"].dt.month
df["day_of_year"] = df["Price Date"].dt.dayofyear

group = df.groupby(
    ["Commodity", "STATE", "District Name", "Market Name"]
)["Modal_Price"]

df["previous_price"] = group.shift(1)
df["price_7_days_ago"] = group.shift(7)
df["price_30_days_ago"] = group.shift(30)

df["future_price"] = group.shift(-1)

df = df.dropna(
    subset=[
        "previous_price",
        "price_7_days_ago",
        "price_30_days_ago",
        "future_price"
    ]
)

# Take one real historical record
sample = df.iloc[-1]

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

X_sample = pd.DataFrame([sample[features]])

prediction = model.predict(X_sample)[0]

print("\n==============================")
print("AI DEMAND SIGNAL PREDICTION")
print("==============================")

print(f"Commodity: {sample['Commodity']}")
print(f"State: {sample['STATE']}")
print(f"District: {sample['District Name']}")
print(f"Market: {sample['Market Name']}")
print(f"Date: {sample['Price Date'].date()}")

print(f"\nCurrent Modal Price: ₹{sample['Modal_Price']:.2f}")
print(f"AI Predicted Next Price: ₹{prediction:.2f}")

print(f"Actual Next Price: ₹{sample['future_price']:.2f}")

print("\nAI model prediction completed successfully.")