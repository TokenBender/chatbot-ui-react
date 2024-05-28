import requests
import nltk
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer, util
import numpy as np
from LexRank import degree_centrality_scores
import sys

def fetch_content_from_url(url):
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')
    return soup.get_text()

def summarize_document(document):
    model = SentenceTransformer("all-MiniLM-L6-v2")
    
    # Split the document into sentences
    sentences = nltk.sent_tokenize(document)
    logger.debug(f'Number of sentences: {len(sentences)}')
    
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

if __name__ == "__main__":
    if len(sys.argv) != 2:
        logger.error("Usage: python summarize.py <URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    document = fetch_content_from_url(url)
    summary = summarize_document(document)
    logger.debug(f'Summary: {summary}')
