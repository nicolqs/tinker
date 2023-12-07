import feedparser
import boto3
import nltk
import json
import pandas as pd
from ulid import ULID
from datetime import datetime
from collections import Counter
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.stem import WordNetLemmatizer
from bs4 import BeautifulSoup

# Run only once
# nltk.download('vader_lexicon')
# nltk.download('punkt')
# nltk.download('stopwords')
# nltk.download('wordnet')

# AWS DynamoDB client
dynamodb = boto3.client("dynamodb", region_name="us-east-1")
prefix = "nicolqs"
table_name = prefix + "-tinker-sentiments"


def write_to_dynamodb(source, common_words_json, sentiment):
    try:
        item = {
            "id": {"S": str(ULID())},
            "Source": {"S": str(source)},
            "source": {"S": str(source)},
            "MainWords": {"S": str(common_words_json)},
            "Sentiment": {"S": str(sentiment)},
            "CreatedAt": {"S": datetime.utcnow().isoformat()},
        }
        response = dynamodb.put_item(
            TableName=table_name,
            Item=item,
        )
        print(f"Successfully wrote item to DynamoDB: {response}")
    except Exception as e:
        print(f"Error writing item to DynamoDB: {e}")
        raise


def extract_sentiment(text):
    sid = SentimentIntensityAnalyzer()
    sentiment_score = sid.polarity_scores(text)["compound"]
    return sentiment_score


def get_common_words(text, num_words=10):
    # Tokenize the text
    tokens = word_tokenize(text)

    # Filter out stop words - such as "and," "the," "of," and "it."
    stop_words = set(stopwords.words("english"))
    filtered_tokens = [
        word.lower()
        for word in tokens
        if word.isalnum() and word.lower() not in stop_words
    ]

    # Lemmatize the tokens - e.g. can remove "ed" and "ing" but keeps it if relevant in context
    lemmatizer = WordNetLemmatizer()
    lemmatized_tokens = [lemmatizer.lemmatize(token) for token in filtered_tokens]

    # Count word occurrences and return most commons
    word_counts = Counter(lemmatized_tokens)
    return word_counts.most_common(num_words)


def compute_data_and_save(data, source):
    # Data Frame
    df = pd.DataFrame(data)
    df_sentiment_means = df[["Title_Sentiment", "Description_Sentiment"]].mean()

    # Compute most common words
    most_common_words = [
        common_words for sublist in data["Common_Words"] for common_words in sublist
    ]
    most_common_words = Counter(dict(most_common_words)).most_common(10)
    words_only = [word for word, _ in most_common_words]
    common_words_json = json.dumps(" ".join(words_only))

    # Write to DB
    write_to_dynamodb(
        source,
        common_words_json,
        df_sentiment_means.loc["Description_Sentiment"],
    )


def process_feed(feed_info):
    feed = feedparser.parse(feed_info.get("url"))
    data = {
        "Title": [],
        "Description": [],
        "Title_Sentiment": [],
        "Description_Sentiment": [],
        "Common_Words": [],
    }

    for entry in feed.entries:
        title = entry.title
        description = entry.description if "description" in entry else ""
        description = BeautifulSoup(description, "html.parser").get_text()

        # Extract sentiment
        title_sentiment = extract_sentiment(title)
        description_sentiment = extract_sentiment(description)

        # Get the most common words
        common_words = get_common_words(title + " " + description)

        if title_sentiment > 0.0:
            data["Title"].append(title)
            data["Description"].append(description)
            data["Title_Sentiment"].append(title_sentiment)
            data["Description_Sentiment"].append(description_sentiment)
            data["Common_Words"].append(common_words)

    compute_data_and_save(data, feed_info.get("source"))


def handler(event, context):
    feed_infos = [
        {
            "source": "Coindesk",
            "url": "https://www.coindesk.com/arc/outboundfeeds/rss/",
        },
        {"source": "Blockchain News", "url": "https://Blockchain.News/RSS/"},
        {"source": "Cryptopanic", "url": "https://cryptopanic.com/news/rss/"},
        {"source": "FXStreet", "url": "https://www.fxstreet.com/rss/crypto"},
        {"source": "BitCoin Magazine", "url": "https://bitcoinmagazine.com/.rss/full/"},
    ]

    [process_feed(feed_info) for feed_info in feed_infos]
