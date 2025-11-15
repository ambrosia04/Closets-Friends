# Closets Friends
Your wardrobe web where you know what to put on!

## Running the Server Locally
This project consists of a frontend (hosted on GitHub Pages) and a Node.js backend server. The live server is hosted on Render, but if you wish to run the backend on your own machine for development or to use your own API keys, follow these instructions. <br>
### Prerequisites
- You must have Node.js and npm installed on your computer.
- You need a valid API Key from SerpApi.
### Setup Instructions
1. Clone the repository:
```
git clone https://github.com/ambrosia04/Closets-Friends.git
cd Closets-Friends
```
2. Navigate to the server directory:
```
cd wardrobe-server
```
3. Install dependencies: <br>
This will install Express, SerpApi, and other necessary packages.
```
npm install
```
4. Create an environment file: <br>
Create a new file in the wardrobe-server directory named .env.
5. Add your API key: <br>
Open the .env file and add your SerpApi key like this:
```
API_KEY=your_serpapi_key_goes_here
```
6. Start the server:
```
node server.js
```

