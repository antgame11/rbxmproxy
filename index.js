import util from 'node:util';
import express from 'express';
import { exec } from 'node:child_process';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';

dotenv.config();
const exe = util.promisify(exec);
const app = express();
const port = 8080;
const cookie = await process.env.cookie;

function getrandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get('/', async (req, res) => {
  try {
    const assetId = req.query.id;
    if (!assetId) return res.status(400).send('Missing id');

    const test = await fetch(`https://assetdelivery.roblox.com/v2/asset/?id=${assetId}`, {
      headers: {
        Cookie: cookie
      }
    });
    if (!test.ok) throw new Error(`Failed to fetch asset info: ${test.status}`);

    const retj = await test.json();
    const assetUrl = retj.locations?.[0]?.location;
    if (!assetUrl) throw new Error('Asset location missing');

    const location = await fetch(assetUrl);
    if (!location.ok) throw new Error(`Failed to fetch asset data: ${location.status}`);

    const fileBuffer = Buffer.from(await location.arrayBuffer());
    res.setHeader("Content-Type", "application/octet-stream");

    if (fileBuffer.toString().startsWith("<roblox xml")) {
      const randomname = `tmp/${getrandom(10000000000, 99999999999)}`;
      await fs.writeFile(`${randomname}.rbxmx`, fileBuffer);
      await exe(`echo "local ok = fs.read('${randomname}.rbxmx', 'rbxmx'); fs.write('${randomname}.rbxm', ok, 'rbxm')" | ./rbxmk run -`);
      const converted = await fs.readFile(`${randomname}.rbxm`);
      res.send(converted);
      await fs.rm(`${randomname}.rbxmx`);
      await fs.rm(`${randomname}.rbxm`);
    } else {
      res.send(fileBuffer);
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('fail');
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
