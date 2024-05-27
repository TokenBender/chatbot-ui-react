from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
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
            "model": MODEL_NAME,
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
    
    # Add the bot response to the chat history
    chat_history.append({"role": "assistant", "content": bot_response})
    
    # Save chat history to a JSONL file with the provided chat name
    chat_name = data.get('chat_name', 'default_chat')
    with open(f'{chat_name}.jsonl', 'a') as f:
        for message in chat_history:
            f.write(json.dumps(message) + '\n')

    return jsonify({'response': bot_response, 'history': chat_history})

@app.route('/config', methods=['GET'])
def config():
    return jsonify({
        'model': MODEL_NAME,
        'using_api_key': bool(OPENROUTER_API_KEY)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
