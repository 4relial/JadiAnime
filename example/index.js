const { JadiAnime } = require('../lib/index')

async function toAnime(path) {
    try {
        let image = await JadiAnime(path)
        console.log(image)
    } catch (e) {
        console.log(e)
    }
}

toAnime(__dirname + '/eula.jpg') // Path to your selfie