# Authentication
Authentication  is responsilbe to authen client request then pass the JWT token to the downstream services.

For saving traffic between client and server, the authentication type between client (browsers) and server would be Stateful but internal communication would be Stateless

In Stateful authentication, the server creates a session for the user after successfully authenticating. The session id is then stored as a cookie in the user's browser and the user session store in the cache or database. When the client tries to access the server with a given session id, the authen attempts to load the user session context for the session store, checks if the session is valid, and load the acording JWT to paste to the downstream services or rejects the request.

Full flows:
1. User input access credentials to perform login
2. API gateway recieve request then forward to Authentication
3. Authentication will identify user against DB, if authen successfully, it will generate a session id plus JWT for the user info to save into DB. Ending the process, it will response to gateway 200 and session-id to pass to clients
4. Client recieve session-id then store to cookie for sub-sequeue request
5. Client send sub-sequeue request to API-gateway, it will then ask for Authen service if the request is permitted or NOT?
6. Authentication service identity request from API-GW, it will check then load the session-id and JWT from DB for checking. If everything is OK, authen will response 200 + JWT in the header for API-GW to paste to the downstream services
