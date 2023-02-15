const { Worker, isMainThread, workerData } = require('worker_threads')
const QRCode = require('qrcode')
const csv = require('fast-csv')
const fs = require('fs')

const NUM_WORKERS = 8 // number of worker threads to spawn
const CSV_FILE = './urls.csv'
const QR_CODES_DIR = './images'

if (isMainThread) {
  if (!fs.existsSync(QR_CODES_DIR)) {
    fs.mkdirSync(QR_CODES_DIR)
  }

  // Read CSV file and split into chunks for each worker
  const urls = []
  fs.createReadStream(CSV_FILE)
    .pipe(csv.parse({ headers: true }))
    .on('data', (row) => urls.push(row.url))
    .on('end', () => {
      const chunks = chunkArray(urls, NUM_WORKERS)
      for (let i = 0; i < chunks.length; i++) {
        new Worker(__filename, { workerData: chunks[i] })
      }
    })
} else {
  // Generate QR codes for URLs in workerData array
  ;(async () => {
    for (const url of workerData) {
      const fileName = url.replace(/[^\w]/g, '')
      const pngBuffer = await QRCode.toBuffer(url, {
        errorCorrectionLevel: 'H',
        scale: 10,
        margin: 1,
      })
      fs.writeFileSync(`${QR_CODES_DIR}/${fileName}.png`, pngBuffer)
    }
  })()
}

function chunkArray(array, numChunks) {
  const chunkSize = Math.ceil(array.length / numChunks)
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}
