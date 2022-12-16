# Jadi Anime

Convert your selfie to Anime style with QQ

## Installation

```
npm i jadianime-ts
```

### Example

```js
const { JadiAnime } = require('jadianime-ts')

async function toAnime(path) {
  try {
  let image = await JadiAnime(path)
  console.log(image)
  } catch (e) {
        console.log(e)
    }
}

toAnime(__dirname + '/eula.jpg') // Path to your selfie
```

### Using Proxy
You can use proxy option if QQ banned your region. Proxy must from a country that is not banned like Indonesia, Japan, etc.
```js
const { JadiAnime } = require('jadianime-ts')

async function toAnime(path) {
    try {
        let opts = {
            proxyType: "socks5", // https or socks5
            proxyUrl: "socks5://172.105.247.104:8080" // change to your proxy url
        }
        let image = await JadiAnime(path, opts)
        console.log(image)
    } catch (e) {
        console.log(e)
    }
}

toAnime(__dirname + '/eula.jpg') // Path to your selfie
```

## Contributions

Software contributions are welcome. If you are not a dev, testing and reproting bugs can also be very helpful!

## Questions?

Please open an issue if you have questions, wish to request a feature, etc.