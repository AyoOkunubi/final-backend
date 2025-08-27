const { BlobServiceClient } = require('@azure/storage-blob');

function getContainerClient() {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const name = process.env.AZURE_STORAGE_CONTAINER_NAME || 'videos';
  if (!conn) throw new Error('Missing AZURE_STORAGE_CONNECTION_STRING');
  const blobServiceClient = BlobServiceClient.fromConnectionString(conn);
  return blobServiceClient.getContainerClient(name);
}

async function ensureBlobContainer() {
  const containerClient = getContainerClient();
  await containerClient.createIfNotExists();
  return true;
}

async function uploadVideo(fileName, buffer, contentType='video/mp4') {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
  return blockBlobClient.url;
}

module.exports = { ensureBlobContainer, uploadVideo };
