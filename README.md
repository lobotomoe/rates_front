# ETH / ERC20 dashboard client app

- Binance websocket endpoint used directly for fastest data update
- Socket.io used for server-side communication
## Instructions
- Copy `.env.example` to `.env` and set required settings
- Yarn: `yarn build` and serve *build* folder how you want
## Docker
- Run `docker run -p LOCAL_PORT:80 msurf/ethornclient`
- Go to `http://localhost:LOCAL_PORT`