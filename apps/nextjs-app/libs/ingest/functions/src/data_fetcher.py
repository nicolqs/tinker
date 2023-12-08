import os
import boto3
import time
import requests
from datetime import datetime, timedelta
from decimal import Decimal

etherscan_api_key = os.environ.get("ETHERSCAN_API_KEY")


def gather_data(exchange_url):
    # Use the requests library to get real-time data from the exchange
    response = requests.get(exchange_url)
    data = response.json()  # Assuming the response is in JSON format
    return data


def aggregate_normalize(data_list):
    # Your aggregation and normalization logic here
    # This is a placeholder for the actual processing you need

    aggregated_data = {}  # Replace with your aggregated data structure

    for data in data_list:
        # Your normalization logic goes here
        # This is a placeholder for the actual processing you need
        pass

    return aggregated_data


# Returns all transactions for block range
def fetch_transactions(start_block, end_block):
    # Address of contract of interest
    proxy_addr = "0x6bE5E073635C7f27d17bf14540e37C63346487F0"
    print(f"Fetching Txs For {proxy_addr} for blocks: {start_block}-{end_block}")

    # Etherscan API URL
    url = f"https://api.etherscan.io/api?module=account&action=txlist&address={proxy_addr}&startblock={start_block}&endblock={end_block}&sort=asc&apikey={etherscan_api_key}"

    # Make the API request
    response = requests.get(url)
    data = response.json().get("result")

    return data


# Uses API to retrieve block number for timestamp
def get_block_for_time(timestamp):
    # Etherscan API URL
    url = f"https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp={timestamp}&closest=before&apikey={etherscan_api_key}"

    # Make the API request
    response = requests.get(url)
    data = response.json().get("result")

    return data


def handler(event, context):
    # List of cryptocurrency exchange URLs
    exchange_urls = [
        "https://api.exchange1.com/ticker",
        "https://api.exchange2.com/ticker",
    ]

    # Get the current date and time and 30 days ago
    date_now = datetime.now()
    date_start = date_now - timedelta(days=30)

    # Use API to get block numbers for timestamps
    start_block = int(get_block_for_time(int(date_start.timestamp())))
    end_block = int(get_block_for_time(int(date_now.timestamp())))
    print(start_block, end_block)

    print(f"Start: {date_start.strftime('%Y-%m-%d %H:%M:%S')} {start_block}")
    print(f"End: {date_now.strftime('%Y-%m-%d %H:%M:%S')} {end_block}")

    txs = []

    # Retrieve all transactions in the specified range using API
    while start_block < end_block:
        end_range = start_block + 15000
        txs_range = fetch_transactions(start_block, end_range)
        # print(f"No of txs: {len(txs_range)}")
        txs.extend(txs_range)
        start_block = end_range + 1
        time.sleep(0.2)

    print(f"Total: {len(txs)} transactions in the period")

    total_gas = Decimal(0)
    total_gas_price = Decimal(0)
    total_cost_eth = Decimal(0)
    gas_price_dist = {}

    # For each tx -
    # Out gasUsed, gasPrice, and ethCost (=gasPrice * gasUsed)
    # Sum gasUsed for avg
    # Sum gasPrice for avg
    # Sum ethCost for avg
    # Create hash table of gasPrice distribution
    print(txs)
    for tx in txs:
        # print("tx is", tx)
        gas_used = Decimal(tx["gasUsed"])
        total_gas += gas_used
        gas_price = Decimal(tx["gasPrice"])
        total_gas_price += gas_price
        eth_cost = gas_price * gas_used
        total_cost_eth += eth_cost
        # print(f"GasUsed: {gas_used}, GasPrice: {gas_price}, Eth Cost: {eth_cost}")

        if tx["gasPrice"] not in gas_price_dist:
            gas_price_dist[tx["gasPrice"]] = 1
        else:
            gas_price_dist[tx["gasPrice"]] += 1
        time.sleep(0.2)

    # Output results
    print(gas_price_dist)
    avg_gas_price = total_gas_price / len(txs)
    print(f"Total Gas Used: {total_gas}")
    print(f"Total Eth: {total_cost_eth}")
    print(f"Average Gas Price: {avg_gas_price}")

    # Gather data from each exchange
    # exchange_data_list = [gather_data(url) for url in exchange_urls]

    # # Aggregate and normalize the data
    # unified_data = aggregate_normalize(exchange_data_list)

    # # Upload the unified data to an S3 bucket or perform any other desired action
    # # s3 = boto3.client("s3")
    # # s3.put_object(
    # #     Body=str(unified_data), Bucket="your-s3-bucket", Key="unified_data.json"
    # # )

    # return {"statusCode": 200, "body": "Lambda function executed successfully!"}
