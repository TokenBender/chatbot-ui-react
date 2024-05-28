from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from search import bing_search
import os
import json
import subprocess
import threading
import time
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
file_handler = logging.FileHandler('backend.log')
file_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

DEBUG_MODE = os.getenv('DEBUG_MODE', 'false').lower() == 'true'

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
MODEL_NAME = os.getenv('MODEL_NAME')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        chat_history = data.get('history', [])
        
        # Clear the chat history if the user message is empty
        if not user_message:
            chat_history = []
        else:
            # Add the user message to the chat history
            chat_history.append({"role": "user", "content": user_message})
        
        logger.debug('Sending chat history to OpenRouter API')
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
            logger.debug('Received response from OpenRouter API')
            logger.debug(f'Response: {response_data}')
            bot_response = response_data.get('choices', [{}])[0].get('message', {}).get('content', 'Error: No response')
        else:
            logger.error(f'Error from OpenRouter API: {response.status_code} {response.text}')
            bot_response = 'Error: No response'
        
        # Add the bot response to the chat history with model name
        chat_history.append({"role": "assistant", "content": bot_response, "model": MODEL_NAME})
        
        # Save chat history to a JSONL file with the provided chat name
        chat_name = data.get('chat_name', 'default_chat')
        with open(f'{chat_name}.jsonl', 'w') as f:
            for message in chat_history:
                f.write(json.dumps(message) + '\n')

        return jsonify({'response': bot_response, 'history': chat_history})
    except Exception as e:
        logger.error(f'Error in /chat endpoint: {str(e)}')
        return jsonify({'error': 'An error occurred while processing the request'}), 500

@app.route('/config', methods=['GET'])
def config():
    try:
        return jsonify({
            'model': MODEL_NAME,
            'using_api_key': bool(OPENROUTER_API_KEY)
        })
    except Exception as e:
        logger.error(f'Error in /config endpoint: {str(e)}')
        return jsonify({'error': 'An error occurred while fetching the configuration'}), 500

@app.route('/models', methods=['GET'])
def get_models():
    # Run the aider command to fetch models
    try:
        result = subprocess.run(['aider', '--models', 'openrouter/'], capture_output=True, text=True, check=True)
        models = [line.split('- ')[1].strip() for line in result.stdout.strip().split('\n') if line.startswith('- openrouter/')]
    except subprocess.CalledProcessError as e:
        print('Error running aider command:', e)
        models = []
    try:
        return jsonify({'models': models})
    except Exception as e:
        logger.error(f'Error in /models endpoint: {str(e)}')
        return jsonify({'error': 'An error occurred while fetching the models'}), 500

@app.route('/update-model', methods=['POST'])
def update_model():
    try:
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
    except Exception as e:
        logger.error(f'Error in /update-model endpoint: {str(e)}')
        return jsonify({'error': 'An error occurred while updating the model'}), 500

@app.route('/bing-search', methods=['POST'])
def bing_search_route():
    try:
        data = request.json
        logger.debug('Received search request')
        search_results = bing_search(data).json
        logger.debug('Search results received')
        summaries = [result["summary"] for result in search_results["results"]]
        summarized_content = "\n".join(summaries)
        
        # Pass the summarized content to the assistant
        chat_history = data.get('history', [])
        user_query = data.get('query', '')
        formatted_message = f"Answer the following user query using the provided web result summary\n User query: {user_query} \n Web Result Summary: {summarized_content}"
        chat_history.append({"role": "user", "content": formatted_message})
        
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
            bot_response = response_data.get('choices', [{}])[0].get('message', {}).get('content', 'Error: No response')
        else:
            bot_response = 'Error: No response'
        
        return jsonify({'response': bot_response, 'history': chat_history})
    except Exception as e:
        logger.error(f'Error in /bing-search endpoint: {str(e)}')
        return jsonify({'error': 'An error occurred while processing the search request'}), 500

def autosave_chats():
    while True:
        try:
            time.sleep(5)  # Save every 5 seconds
            for chat_name in os.listdir('.'):
                if chat_name.endswith('.jsonl') and DEBUG_MODE:
                    logger.debug(f'Autosaving chat: {chat_name}')
                    with open(chat_name, 'r') as f:
                        chat_history = f.readlines()
                    with open(chat_name, 'w') as f:
                        for message in chat_history:
                            f.write(message)
        except Exception as e:
            logger.error(f'Error in autosave_chats function: {str(e)}')

if __name__ == '__main__':
    autosave_thread = threading.Thread(target=autosave_chats, daemon=True)
    autosave_thread.start()
    app.run(host='0.0.0.0', port=5001)
