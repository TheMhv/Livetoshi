# LiveSatoshi
Enable TTS messages with voice models in your live stream using payments on Lightning Network

## Instalation

>#### You will need a configured and active [LiveSatoshi-Server](https://github.com/TheMhv/LiveSatoshi-Server) to run this project.

* First, install the packages:

```bash
$ npm install
```

* Create the `.env` file:

> you can copy from `.env.example`:
> ```bash
> $ cp .env.example .env
> ```

* Set the `RVC_API_HOST` and `RVC_API_HOST` variables to the address of your [LiveSatoshi-Server](https://github.com/TheMhv/LiveSatoshi-Server)

* Then, run the development server:
```bash
$ npm run dev
```

Open `http://localhost:3000` with your browser to see the result.

## Customization

If you want to customize the payment page, feel free to edit the `src/app/page.tsx` file