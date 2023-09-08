<h1 align="center">
    <img src="public/logo.png" width="66" height="66" alt="logo"/>
    <br />
    Spotlight
</h1>

<p align="center">
    Display your Spotify stats on your bio.
</p>

## 📖 About

This is a simple node app that uses [Spotify Web API](https://developer.spotify.com/documentation/web-api) to get a 
user's currently playing track and displays it on their GitHub bio (and possibly other platforms in the future). 
This app runs a scheduled job every 3 minutes using [node-schedule](https://www.npmjs.com/package/node-schedule) to 
query for the currently playing track and updates the bio. 

Currently, I have an instance running as a process locally on my own device using [pm2](https://pm2.keymetrics.io/).
You can see it in action on my [GitHub profile](https://github.com/yawjalik) bio.
There are no plans to deploy the app and support multiple users at the moment, but feel free to run it yourself.

## 🚀 Usage

### Prerequisites

- Spotify and GitHub accounts
- Node.js v18 or higher (this project uses Node's built in fetch API)
- A Spotify app with a client ID and client secret (see [here](https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app) for more info)
- A GitHub personal access token with `user` scope (see [here](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) for more info)
- Redis running locally (see [here](https://redis.io/topics/quickstart) for more info)

### Installation

1. Install dependencies
    ```bash
    npm install
    ```
    
    or 
    
    ```bash
    yarn install
    ```

2. Create a `.env` file in the root directory based on the `.env.example` file. Ensure that the `SPOTIFY_REDIRECT_URL` 
   matches the redirect URL you set in your Spotify app settings and should be something like 
    `http://localhost:8888/callback` if you're running the app locally. Spotify will redirect to this URL after the
    user authorizes the app which will then exchange the authorization code for an access token and refresh token
   [(auth code flow)](https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow).


### Running the app

You may build the app using `npm run build` or `yarn build` and then run it using `npm run start` or `yarn start`.
Alternatively, you may run the app in development mode using `npm run dev` or `yarn dev`.

### Using PM2

[PM2](https://pm2.keymetrics.io/) is a process manager for Node.js applications. It allows you to run your app in the
background as a daemon and provides a lot of useful features such as automatic restarts, logs, and more.
Install PM2 globally using `npm install pm2 -g` or `yarn global add pm2`. You may then run the app using
`pm2 start "node -r dotenv/config /path/to/your/build/index.js"`.

## 📚 Resources

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [GitHub API](https://docs.github.com/en/rest)
- [Redis](https://redis.io/)
- [node-redis](https://www.npmjs.com/package/redis)
- [pm2](https://pm2.keymetrics.io/)
- [node-schedule](https://www.npmjs.com/package/node-schedule)
