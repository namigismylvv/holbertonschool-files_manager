import { writeFileSync } from 'fs';
import DBClient from './utils/db';

const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');

const fileQueue = new Queue('fileQueue');
const thumbnailSizes = [500, 250, 100];

fileQueue.process(async (job, done) => {
  if (!job.data.fileId) {
    done(Error('Missing fileId'));
  }

  if (!job.data.userId) {
    done(Error('Missing userId'));
  }

  const fileInfo = await DBClient.findFileById(job.data.fileId, job.data.userId);
  if (!fileInfo) {
    done(Error('File not found'));
  }

  const promises = thumbnailSizes.map((width) => imageThumbnail(fileInfo.localPath, { width })
    .then((buffer) => {
      writeFileSync(`${fileInfo.localPath}_${width}`, buffer);
    }));

  await Promise.all(promises);

  done();
});
