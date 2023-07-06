# Vault



**.vaultfile**
```
{
  "source": { "id": "https://example.org/manifest", "type": "Manifest" },
  "resources": {
    "https://example.org/manifest": "./manifest.json",
  }
}
```


The server vault will take this optional config and use it to load the manifest from the file system. The instance of
vault will live on the server for a period of time and can be stopped or started.

Multiple clients can then connect to the vault and use the manifest. They can connect as a read-only user or as a
read-write user. The read-write user can make changes to the manifest and save it back to the vault. These changes will
be reflected in the vault and will be available to all users. The changes will also be reflected in the file system
where the manifest is stored.

Vault communicates using atomic actions. These actions are sent to the vault and the vault will respond with the result
of the action. The vault will also broadcast the action to all connected clients. The clients can then update their
state based on the action. If the actions are applied in the same order on all clients then the state of the clients
will be the same.

Each action will have a unique id. This id will be used to ensure that the actions are applied in the same order on all
clients. Clients are required to send the previous action id with each action. The vault will then check that the
previous action id matches the last action id that was applied to the vault. If the previous action id does not match
then the action will be rejected. The client will then need to update its state to match the vault and then try again.

## Post Message communication

The server will also host a webpage that can be used to communicate with the vault. This webpage will be loaded in an
iframe on the client. The client will then be able to connect to the vault and send actions to the vault. The vault
will then broadcast the actions to all connected clients. The client will then update its state based on the actions.

This allows the client to be a static webpage that can be hosted on any server. The client will not need to be hosted
on the same server as the vault. However, the server will need to allow cross-origin requests from the client, and will
ensure that only select hosts are allowed to connect to the vault.

For post-message you have the server iframe, communicating to the server via web-sockets and the client application
that has the server in an iframe. When an event originates from the client, the following happens:

- The client sends a message to the server iframe via post-message
- The server iframe sends a message to the server via web-sockets
- The server broadcasts the message to all connected clients via web-sockets
- The server iframe receives the message from the server via web-sockets
- The server iframe sends the message to the other clients via post-message

When an event originates from the server, the following happens:
- The server sends a message to the server iframe via web-sockets
- The server iframe sends the message to the other clients via post-message


- ClientPostMessageVault.dispatch() -> sends message to server iframe
- ServerPostMessageVault.dispatch() -> sends message to server
- ServerWebSocketVault.dispatch() -> sends message to all clients



## GitHub integration

On the server there will be a GitHub integration. This integration will allow the vault to be connected to a GitHub
repository. The vault will then be able to load the manifest from the GitHub repository. The vault will also be able
to save the manifest to the GitHub repository.

As changes are made to the manifest the vault will commit the changes to the GitHub repository. The server will also
create a pull request for the changes.

When a client requests a vault instance, the server will create a new branch in the GitHub repository. The vault will
then load the manifest from the new branch. The client will then be able to make changes to the manifest. Alternatively
the client can request a read-only instance of the vault. The client will then be able to view the manifest but will
not be able to make changes to the manifest.

Clients can also request an existing branch. The vault will then load the manifest from the existing branch. The client
will then be able to make changes to the manifest. The client will also be able to save the changes to the existing
branch. If other clients are also connected to the vault then they will be able to see the changes that the client has
made.

## Authentication

On the client the user will be able to login to GitHub through the server. This will be done by opening a popup window served by the  server. The user will then be able to login to GitHub and grant the server access to their GitHub account.
Initially this will only be for authentication and will grant access to manifests hosted in SQLite on the server. Eventually
this will also allow the server to access manifests hosted in GitHub repositories.

Once logged in the server will redirect back to the client. The client will then be able to use the access token to
create an iFrame that can be used to communicate with the vault.

## Listing projects

Before a client can connect to a vault it will need to know the id of the vault. The client will be able to request a
list of vaults from the server. This is also done using a post message. The server will then respond with a list of
vaults that the user has access to. The client will then be able to connect to the vault.


## Server responsibilities and routes

- [ ] Request login status of the user using a post message
- [ ] Request a list of vaults using a post message
- [ ] Request a vault instance using a post message
- [ ] Login via Github in a popup
- [ ] Create a new vault instance


2 new types of Vault instance

- Server vault
- Client vault

**Server vault**
1. Creates normal internal vault instance
2. Loads manifest from file system
3. Handles client opening and closing connections
4. Accepts client actions
  - Applies action to internal vault instance
  - Responds to client with result of action
  - Broadcasts action to all connected clients
5. Saves manifest to file system periodically


**Client vault**
1. Connects to server vault
  - Opens connection
  - Loads initial state from server vault, including last action id
2. Sends actions to server vault
  - Includes last action id
  - Waits for response from server vault
  - Updates state based on response from server vault
  - If response is an error then update state to match server vault
  - May retry action if response is a conflict
3. Receives actions from server vault
4. Applies actions to internal vault instance

