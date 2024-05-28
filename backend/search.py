import os
import requests
from flask import jsonify
from summarize import fetch_content_from_url, summarize_document
import logging
import os

# Set up logging
logger = logging.getLogger(__name__)
DEBUG_MODE = os.getenv('DEBUG_MODE', 'false').lower() == 'true'

def bing_search(data):
    try:
        query = data.get('query', '')
        subscription_key = os.getenv('BING_SEARCH_API_KEY')

        if not subscription_key:
            return jsonify({'error': 'Bing Search API key is missing'}), 500

        endpoint = "https://api.bing.microsoft.com/v7.0/search"
        headers = {"Ocp-Apim-Subscription-Key": subscription_key}
        params = {"q": query, "textDecorations": True, "textFormat": "HTML"}

        logger.debug('Sending request to Bing Search API');
        try:
            response = requests.get(endpoint, headers=headers, params=params)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return jsonify({'error': f'Error fetching search results: {str(e)}'}), 500

        try:
            search_results = response.json()
            logger.debug('Received response from Bing Search API');
            results = []
            for result in search_results.get("webPages", {}).get("value", [])[:4]:
                results.append({
                    "name": result["name"],
                    "url": result["url"],
                    "snippet": result["snippet"]
                })
        except (ValueError, KeyError) as e:
            return jsonify({'error': f'Error parsing search results: {str(e)}'}), 500

        logger.debug('Processing search results');
        summaries = []
        for result in results:
            try:
                content = fetch_content_from_url(result["url"])
                summary = summarize_document(content)
                summaries.append({
                    "name": result["name"],
                    "url": result["url"],
                    "snippet": result["snippet"],
                    "summary": summary
                })
            except requests.exceptions.RequestException as e:
                continue
            except requests.exceptions.Timeout as e:
                continue
            except Exception as e:
                summaries.append({
                    "name": result["name"],
                    "url": result["url"],
                    "snippet": result["snippet"],
                    "summary": f"Error summarizing content: {str(e)}"
                })

        logger.debug('Returning summarized search results');
        return {'results': summaries}
    except Exception as e:
        logger.error(f'Error in bing_search function: {str(e)}')
        return jsonify({'error': 'An error occurred while processing the search request'}), 500
