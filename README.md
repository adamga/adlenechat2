# adlenechat2

## Chat Interface Implementation

The chat interface includes user authentication, handles user input, and displays chat history.

### User Authentication

* A login form is provided for user authentication.
* User credentials are securely stored using environment variables and Azure Key Vault.

### User Input Handling

* An event listener is implemented for the text input field to capture user messages and send them to the Node.js server.
* AJAX or Fetch API is used to communicate with the Node.js server and receive responses from Azure OpenAI.

### Chat History Display

* The chat history display area is updated with both user messages and responses from Azure OpenAI.
* Chat history is stored in CosmosDB, associating each message with the authenticated user.

## Setting Up Environment Variables and Using Azure Key Vault for Secrets Management

1. Store sensitive information like database connection strings, API keys, and other secrets in environment variables.
2. Use Azure Key Vault to securely store and manage sensitive information.
3. Ensure that the application retrieves these secrets securely at runtime and does not hard-code them in the source code.

## Deploying the Application Using Terraform

1. Define the necessary Azure resources, including a web application to host the chatbot.
2. Define the CosmosDB database for storing chat history.
3. Define the Azure Key Vault for secrets management.
4. Use Terraform to deploy the defined resources to Azure.
