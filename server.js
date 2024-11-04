const express = require('express');
const bodyParser = require('body-parser');
const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

const keyVaultName = process.env.KEY_VAULT_NAME;
const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(keyVaultUrl, credential);

let cosmosClient;
let openAiApiKey;

async function initialize() {
    const cosmosDbConnectionString = await secretClient.getSecret('CosmosDbConnectionString');
    cosmosClient = new CosmosClient(cosmosDbConnectionString.value);

    const openAiApiKeySecret = await secretClient.getSecret('OpenAiApiKey');
    openAiApiKey = openAiApiKeySecret.value;
}

initialize().catch(err => {
    console.error('Failed to initialize:', err);
    process.exit(1);
});

app.post('/api/chat', async (req, res) => {
    const { username, message } = req.body;

    try {
        const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAiApiKey}`
            },
            body: JSON.stringify({
                prompt: message,
                max_tokens: 150
            })
        });

        const data = await response.json();
        const botResponse = data.choices[0].text.trim();

        const { database } = await cosmosClient.databases.createIfNotExists({ id: 'ChatDatabase' });
        const { container } = await database.containers.createIfNotExists({ id: 'ChatContainer' });

        await container.items.create({
            username,
            message,
            botResponse,
            timestamp: new Date().toISOString()
        });

        res.json({ response: botResponse });
    } catch (err) {
        console.error('Error handling chat message:', err);
        res.status(500).send('Internal Server Error');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
