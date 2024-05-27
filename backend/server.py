from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests
import os
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
        },
        stream=True,
    )
    
    def generate():
        try:
            for line in response.iter_lines():
                if line:
                    yield f"data: {line.decode('utf-8')}\n\n"
        except Exception as e:
            print(f"Error streaming response: {e}")
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/config', methods=['GET'])
def config():
    return jsonify({
        'model': MODEL_NAME,
        'using_api_key': bool(OPENROUTER_API_KEY)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)