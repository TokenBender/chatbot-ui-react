# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
# ChatMaxx Furiousa

This project is a chatbot user interface built with React and Flask. It allows users to interact with a chatbot powered by OpenRouter's API.

## Features

- **Chat Interface**: A user-friendly chat interface to interact with the chatbot.
- **Model Selection**: Dropdown to select different models from OpenRouter.
- **Chat History**: Save and load chat history for each session.
- **Dark Theme**: A dark-themed UI for better user experience.
- **Local Storage**: Save chat history to local storage every 5 seconds.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Python (v3.6 or later)
- Flask
- OpenRouter API Key

### Installation

1. **Clone the repository**:
    ```sh
    git clone <repository-url>
    cd chatbot-ui
    ```

2. **Install frontend dependencies**:
    ```sh
    cd frontend
    npm install
    ```

3. **Install backend dependencies**:
    ```sh
    cd backend
    pip install -r requirements.txt
    ```

4. **Install aider-chat**:
    ```sh
    pip install aider-chat
    ```

5. **Set up environment variables**:
    Create a `.env` file in the `backend` directory with the following content:
    ```env
    OPENROUTER_API_KEY=your_openrouter_api_key
    MODEL_NAME=default_model
    ```

### Running the Application

1. **Start the backend server**:
    ```sh
    cd backend
    python server.py
    ```

2. **Start the frontend development server**:
    ```sh
    cd frontend
    npm start
    ```

3. Open your browser and navigate to `http://localhost:3000`.

## Project Structure

- **frontend**: Contains the React application.
  - `src/components`: React components for the UI.
  - `src/context`: Context for managing global state.
  - `src/App.js`: Main application component.
  - `src/index.js`: Entry point for the React application.
- **backend**: Contains the Flask server.
  - `server.py`: Main server file.
  - `.env`: Environment variables for the backend.

## Available Scripts

In the `frontend` directory, you can run:

- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner.
- `npm run build`: Builds the app for production.

## API Endpoints

- **POST /chat**: Send a message to the chatbot.
  - Request body:
    ```json
    {
      "message": "Hello",
      "history": [],
      "chat_name": "default_chat"
    }
    ```
  - Response body:
    ```json
    {
      "response": "Hi there!",
      "history": [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"}
      ]
    }
    ```

- **GET /config**: Get the current model configuration.
  - Response body:
    ```json
    {
      "model": "default_model",
      "using_api_key": true
    }
    ```

- **GET /models**: Get the list of available models.
  - Response body:
    ```json
    {
      "models": ["model1", "model2"]
    }
    ```

- **POST /update-model**: Update the current model.
  - Request body:
    ```json
    {
      "model": "new_model"
    }
    ```
  - Response body:
    ```json
    {
      "model": "new_model",
      "using_api_key": true
    }
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Flask](https://flask.palletsprojects.com/)
- [OpenRouter](https://openrouter.ai/)
