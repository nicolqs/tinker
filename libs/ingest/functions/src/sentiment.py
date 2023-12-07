import pandas as pd
import feedparser
from collections import Counter
import nltk
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

def extract_sentiment(text):
  sid = SentimentIntensityAnalyzer()
  sentiment_score = sid.polarity_scores(text)['compound']
  return sentiment_score

def get_common_words(text, num_words=10):
  # Tokenize the text
  tokens = word_tokenize(text)
  
  # Filter out stop words - such as "and," "the," "of," and "it."
  stop_words = set(stopwords.words('english'))
  filtered_tokens = [word.lower() for word in tokens if word.isalnum() and word.lower() not in stop_words]

  # Lemmatize the tokens - e.g. can remove "ed" and "ing" but keeps it if relevant in context
  lemmatizer = WordNetLemmatizer()
  lemmatized_tokens = [lemmatizer.lemmatize(token) for token in filtered_tokens]

  # Count word occurrences and return most commons
  word_counts = Counter(lemmatized_tokens)
  return word_counts.most_common(num_words)

def process_feed(feed_url):
  feed = feedparser.parse(feed_url)
  data = {'Title': [], 'Description': [], 'Title_Sentiment': [], 'Description_Sentiment': []}

  sentiments = []

  for entry in feed.entries:
      title = entry.title
      description = entry.description if 'description' in entry else ''
      description = BeautifulSoup(description, 'html.parser').get_text()

      # Extract sentiment
      title_sentiment = extract_sentiment(title)
      description_sentiment = extract_sentiment(description)
      
      # Get the most common words
      common_words = get_common_words(title + " " + description)

      if title_sentiment > 0.0:
          # print(f"Title: {title}")
          # print(f"Title Sentiment: {title_sentiment}")

          # print(f"Description: {description}")
          # print(f"Description Sentiment: {description_sentiment}")
          
          # print(common_words)

          # print("=" * 200)
          
          sentiments.append(title_sentiment)
          sentiments.append(description_sentiment)
          
          data['Title'].append(title)
          data['Description'].append(description)
          data['Title_Sentiment'].append(title_sentiment)
          data['Description_Sentiment'].append(description_sentiment)

  
  df = pd.DataFrame(data)
  print(df)
  df_sentiment_mean = df[["Title_Sentiment","Description_Sentiment"]].mean()
  # print(f"General sentiment is {df_sentiment_mean}")
  df2 = df.describe()
  # print(df2)

def handler(event, context):
  feed_urls = [
      # 'https://www.coindesk.com/arc/outboundfeeds/rss/',
      # 'https://Blockchain.News/RSS/',
      # 'https://cryptopanic.com/news/rss/',
      # 'https://www.fxstreet.com/rss/crypto',
      'https://bitcoinmagazine.com/.rss/full/'
  ]
  
  [process_feed(feed_url) for feed_url in feed_urls]
