# LiveSatoshi
Enable TTS messages with voice models in your live stream using payments on Lightning Network

## Instalation

* First, install the packages:

```bash
$ npm install
```

### Config your .env

Copy the example .env
```bash
$ cp .env.example .env
```

Change values according to your preference.

## Usage

* You can run the development server on localhost:
```bash
$ npm run dev
```

Open `http://localhost:3000` with your browser to see the result.

## Deploy

For deploy, first you need to build:
```bash
$ npm run build
```

Then, start the server:
```bash
$ npm run start
```

And run the [widget project](https://github.com/TheMhv/LiveSatoshi-Server).