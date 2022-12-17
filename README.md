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

### Options
```js
const { JadiAnime } = require('jadianime-ts')

async function toAnime(path) {
    try {
        let options = {
            // You can use proxy option if QQ banned your region.
            proxy: "socks5://172.105.247.104:8080", // https or socks5
            qqmode: 'china' // Use China or World
            // You must use china proxy if using qqmode china
        }
        let image = await JadiAnime(path, options)
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