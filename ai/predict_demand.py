import sys
import json
import os
import pandas as pd
import joblib


AI_FOLDER = os.path.dirname(os.path.abspath(__file__))

DATA_FILE = os.path.join(AI_FOLDER, "Agriculture_price_dataset.csv")
MODEL_FILE = os.path.join(AI_FOLDER, "demand_model.pkl")


def main():

    commodity = sys.argv[1]
    state = sys.argv[2]
    district = sys.argv[3]
    market = sys.argv[4]

    # Load model and dataset
    model = joblib.load(MODEL_FILE)
    df = pd.read_csv(DATA_FILE)

    df["Price Date"] = pd.to_datetime(df["Price Date"])

    # Sort historical records
    df = df.sort_values(
        ["Commodity", "STATE", "District Name", "Market Name", "Price Date"]
    )

    # Create time features
    df["year"] = df["Price Date"].dt.year
    df["month"] = df["Price Date"].dt.month
    df["day_of_year"] = df["Price Date"].dt.dayofyear

    # Historical price features
    group = df.groupby(
        ["Commodity", "STATE", "District Name", "Market Name"]
    )["Modal_Price"]

    df["previous_price"] = group.shift(1)
    df["price_7_days_ago"] = group.shift(7)
    df["price_30_days_ago"] = group.shift(30)

    # Select requested market
    market_data = df[
        (df["Commodity"] == commodity) &
        (df["STATE"] == state) &
        (df["District Name"] == district) &
        (df["Market Name"] == market)
    ].copy()

    market_data = market_data.dropna(
        subset=[
            "previous_price",
            "price_7_days_ago",
            "price_30_days_ago"
        ]
    )

    if market_data.empty:
        print(json.dumps({
            "error": "Not enough historical data for this market"
        }))
        return

    # Latest available record
    sample = market_data.iloc[-1]

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

    X = pd.DataFrame([sample[features]])

    # Genuine ML prediction
    prediction = float(model.predict(X)[0])

    current_price = float(sample["Modal_Price"])

    # Price movement used as the demand signal
    price_change = prediction - current_price

    if price_change > 0:
        signal = "Increasing"
    elif price_change < 0:
        signal = "Decreasing"
    else:
        signal = "Stable"

    result = {
        "commodity": commodity,
        "state": state,
        "district": district,
        "market": market,
        "dataDate": sample["Price Date"].strftime("%Y-%m-%d"),
        "currentPrice": round(current_price, 2),
        "predictedPrice": round(prediction, 2),
        "priceChange": round(price_change, 2),
        "demandSignal": signal
    }

    print(json.dumps(result))


if __name__ == "__main__":
    main()