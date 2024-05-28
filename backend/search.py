import os
import requests
from flask import jsonify

def bing_search(data):
    query = data.get('query', '')
    subscription_key = os.getenv('BING_SEARCH_API_KEY')

    if not subscription_key:
        return jsonify({'error': 'Bing Search API key is missing'}), 500

    endpoint = "https://api.bing.microsoft.com/v7.0/search"
    headers = {"Ocp-Apim-Subscription-Key": subscription_key}
    params = {"q": query, "textDecorations": True, "textFormat": "HTML"}

    try:
        response = requests.get(endpoint, headers=headers, params=params)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Error fetching search results: {str(e)}'}), 500

    try:
        search_results = response.json()
        print('Bing Search API response:', search_results)  # Log the response from Bing Search API
        results = [
            {
                "name": result["name"],
                "url": result["url"],
                "snippet": result["snippet"]
            }
            for result in search_results.get("webPages", {}).get("value", [])
        ]
    except (ValueError, KeyError) as e:
        return jsonify({'error': f'Error parsing search results: {str(e)}'}), 500

    return jsonify({'results': results})
