from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
import subprocess
import threading
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
MODEL_NAME = os.getenv('MODEL_NAME')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    chat_history = data.get('history', [])
    
    # Clear the chat history if the user message is empty
    if not user_message:
        chat_history = []
    else:
        # Add the user message to the chat history
        chat_history.append({"role": "user", "content": user_message})
    
    print('Sending chat history to OpenRouter API:', chat_history)
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": MODEL_NAME.replace('openrouter/', ''),
            "messages": chat_history
        }
    )
    
    if response.status_code == 200:
        response_data = response.json()
        print('OpenRouter API response:', response_data)
        bot_response = response_data.get('choices', [{}])[0].get('message', {}).get('content', 'Error: No response')
    else:
        print('Error from OpenRouter API:', response.status_code, response.text)
        bot_response = 'Error: No response'
    
    # Add the bot response to the chat history with model name
    chat_history.append({"role": "assistant", "content": bot_response, "model": MODEL_NAME})
    
    # Save chat history to a JSONL file with the provided chat name
    chat_name = data.get('chat_name', 'default_chat')
    with open(f'{chat_name}.jsonl', 'w') as f:
        for message in chat_history:
            f.write(json.dumps(message) + '\n')

    return jsonify({'response': bot_response, 'history': chat_history})

@app.route('/config', methods=['GET'])
def config():
    return jsonify({
        'model': MODEL_NAME,
        'using_api_key': bool(OPENROUTER_API_KEY)
    })

@app.route('/models', methods=['GET'])
def get_models():
    # Run the aider command to fetch models
    try:
        result = subprocess.run(['aider', '--models', 'openrouter/'], capture_output=True, text=True, check=True)
        models = [line.split('- ')[1].strip() for line in result.stdout.strip().split('\n') if line.startswith('- openrouter/')]
    except subprocess.CalledProcessError as e:
        print('Error running aider command:', e)
        models = []
    return jsonify({'models': models})

@app.route('/update-model', methods=['POST'])
def update_model():
    data = request.json
    new_model = data.get('model', '')

    # Update the .env file with the new model
    with open('.env', 'r') as file:
        lines = file.readlines()

    with open('.env', 'w') as file:
        for line in lines:
            if line.startswith('MODEL_NAME='):
                file.write(f'MODEL_NAME={new_model}\n')
            else:
                file.write(line)

    global MODEL_NAME
    MODEL_NAME = new_model

    return jsonify({'model': MODEL_NAME, 'using_api_key': bool(OPENROUTER_API_KEY)})

@app.route('/bing-search', methods=['POST'])
def bing_search():
    data = request.json
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

def autosave_chats():
    while True:
        time.sleep(5)  # Save every 5 seconds
        print('Autosave running...')
        for chat_name in os.listdir('.'):
            if chat_name.endswith('.jsonl'):
                print(f'Autosaving chat: {chat_name}')
                with open(chat_name, 'r') as f:
                    chat_history = f.readlines()
                with open(chat_name, 'w') as f:
                    for message in chat_history:
                        f.write(message)

if __name__ == '__main__':
    autosave_thread = threading.Thread(target=autosave_chats, daemon=True)
    autosave_thread.start()
    app.run(host='0.0.0.0', port=5001)
