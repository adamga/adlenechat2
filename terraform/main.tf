provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "chatbot-resource-group"
  location = "West Europe"
}

resource "azurerm_app_service_plan" "main" {
  name                = "chatbot-app-service-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku {
    tier = "Standard"
    size = "S1"
  }
}

resource "azurerm_app_service" "main" {
  name                = "chatbot-app-service"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  app_service_plan_id = azurerm_app_service_plan.main.id

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "14.17.0"
    "KEY_VAULT_NAME"               = azurerm_key_vault.main.name
  }
}

resource "azurerm_cosmosdb_account" "main" {
  name                = "chatbot-cosmosdb-account"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  consistency_policy {
    consistency_level = "Session"
  }
  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "chatbot-cosmosdb-database"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
}

resource "azurerm_cosmosdb_sql_container" "main" {
  name                = "chatbot-cosmosdb-container"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_path  = "/username"
}

resource "azurerm_key_vault" "main" {
  name                = "chatbot-key-vault"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
}

resource "azurerm_key_vault_secret" "cosmosdb_connection_string" {
  name         = "CosmosDbConnectionString"
  value        = azurerm_cosmosdb_account.main.connection_strings[0]
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "openai_api_key" {
  name         = "OpenAiApiKey"
  value        = var.openai_api_key
  key_vault_id = azurerm_key_vault.main.id
}
