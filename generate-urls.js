const fs = require('fs')

const NUM_URLS = 10000
const CSV_FILE = './urls.csv'

function getRandomUrl() {
  const randomString = Math.random().toString(36).substring(2, 15)
  return `https://qrgb.io/${randomString}`
}

async function generateUrlsCsv(numUrls, csvFile) {
  const stream = fs.createWriteStream(csvFile, { flags: 'a' })
  stream.write('url\n')

  for (let i = 0; i < numUrls; i++) {
    const url = getRandomUrl()
    stream.write(`${url}\n`)
  }

  stream.end()
  console.log(`Generated ${numUrls} URLs in ${csvFile}`)
}

generateUrlsCsv(NUM_URLS, CSV_FILE)
