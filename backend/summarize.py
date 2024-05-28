import requests
import nltk
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer, util
import numpy as np
from LexRank import degree_centrality_scores
import logging
import os

# Set up logging
logger = logging.getLogger(__name__)
DEBUG_MODE = os.getenv('DEBUG_MODE', 'false').lower() == 'true'
import sys

def fetch_content_from_url(url):
    try:
        response = requests.get(url, timeout=1)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        return soup.get_text()
    except requests.exceptions.RequestException as e:
        logger.error(f'Error fetching content from {url}: {str(e)}')
        raise
    except requests.exceptions.Timeout as e:
        logger.error(f'Timeout fetching content from {url}: {str(e)}')
        raise
    except Exception as e:
        logger.error(f'Unexpected error fetching content from {url}: {str(e)}')
        raise

def summarize_document(document):
    try:
        model = SentenceTransformer("all-MiniLM-L6-v2")
        
        # Split the document into sentences
        sentences = nltk.sent_tokenize(document)
        
        # Compute the sentence embeddings
        embeddings = model.encode(sentences, convert_to_tensor=True)
        
        # Compute the pair-wise cosine similarities
        cos_scores = util.cos_sim(embeddings, embeddings).cpu().numpy()
        
        # Compute the centrality for each sentence
        centrality_scores = degree_centrality_scores(cos_scores, threshold=None)
        
        # We argsort so that the first element is the sentence with the highest score
        most_central_sentence_indices = np.argsort(-centrality_scores)
        
        # Print the 5 sentences with the highest scores
        summary = "\n".join([sentences[idx].strip() for idx in most_central_sentence_indices[0:5]])
        return summary
    except Exception as e:
        logger.error(f'Error summarizing document: {str(e)}')
        raise

if __name__ == "__main__":
    if len(sys.argv) != 2:
        logger.error("Usage: python summarize.py <URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    document = fetch_content_from_url(url)
    summary = summarize_document(document)
