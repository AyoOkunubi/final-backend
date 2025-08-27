const { CosmosClient } = require('@azure/cosmos');

let _videos, _comments, _users;

async function initCosmos() {
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  const databaseId = process.env.COSMOS_DATABASE || 'VideoApp';
  const videosId = process.env.COSMOS_CONTAINER_VIDEOS || 'Videos';
  const commentsId = process.env.COSMOS_CONTAINER_COMMENTS || 'Comments';
  const usersId = process.env.COSMOS_CONTAINER_USERS || 'Users';

  if (!endpoint || !key) throw new Error('Missing COSMOS_ENDPOINT or COSMOS_KEY');
  const client = new CosmosClient({ endpoint, key });

  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const { container: videos } = await database.containers.createIfNotExists({
    id: videosId, partitionKey: { kind: 'Hash', paths: ['/id'] }
  });
  const { container: comments } = await database.containers.createIfNotExists({
    id: commentsId, partitionKey: { kind: 'Hash', paths: ['/videoId'] }
  });
  const { container: users } = await database.containers.createIfNotExists({
    id: usersId, partitionKey: { kind: 'Hash', paths: ['/email'] }
  });

  _videos = videos; _comments = comments; _users = users;
  return true;
}

function containers() {
  if (!_videos || !_comments || !_users) throw new Error('Cosmos not initialized');
  return { videos: _videos, comments: _comments, users: _users };
}

async function saveVideo(video) {
  const { videos } = containers();
  const { resource } = await videos.items.create(video);
  return resource;
}
async function listVideos() {
  const { videos } = containers();
  const { resources } = await videos.items.query('SELECT * FROM c ORDER BY c.createdAt DESC').fetchAll();
  return resources;
}

async function addComment(comment) {
  const { comments } = containers();
  const { resource } = await comments.items.create(comment);
  return resource;
}
async function getComments(videoId) {
  const { comments } = containers();
  const query = { query: 'SELECT * FROM c WHERE c.videoId = @videoId ORDER BY c.createdAt DESC', parameters: [{ name: '@videoId', value: videoId }] };
  const { resources } = await comments.items.query(query).fetchAll();
  return resources;
}

async function findUserByEmail(email) {
  const { users } = containers();
  const query = { query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email }] };
  const { resources } = await users.items.query(query).fetchAll();
  return resources[0] || null;
}
async function createUser(user) {
  const { users } = containers();
  const { resource } = await users.items.create(user);
  return resource;
}

module.exports = { initCosmos, saveVideo, listVideos, addComment, getComments, findUserByEmail, createUser };
