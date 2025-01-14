# Livetoshi

Enable TTS messages with voice models in your live stream using NOSTR Zaps

Try now: https://livetoshi.stream

## Usage

### Zaps

You can go to `/profile/<npub>` to access some profile.
Ex: [TheMhv](https://livetoshi.stream/profile/npub1v3ps5nhexd9fdur4gz82xgc3jmhqwduqhrhy7lwtmm727m086u5sqnuvcz)

And go to `/profile/<npub>/widget` to access the TTS widget:
Ex: [TheMhv Widget](https://livetoshi.stream/profile/npub1v3ps5nhexd9fdur4gz82xgc3jmhqwduqhrhy7lwtmm727m086u5sqnuvcz/widget)

# Local Deployment
## Instalation

- First, install the packages:

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

- You can run the development server on localhost:

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

And run the [widget project](https://github.com/TheMhv/Livetoshi-TTS).
