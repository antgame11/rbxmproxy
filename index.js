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

app.get('/', async (req, res) => {
  try {
    const assetId = req.query.id;
    if (!assetId) return res.status(400).send('Missing id');
    //THIS USES A ROBLOX PROXY! PLEASE DO NOT USE YOUR MAIN ACCOUNT'S COOKIES!!!
    const test = await fetch(`https://assetdelivery.roproxy.com/v2/asset/?id=${assetId}`, {
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
    res.setHeader("Content-Disposition",`attachment; filename=${assetId}.rbxm`)
    if (fileBuffer.toString().startsWith("<roblox xml")) {
      const locname = `tmp/${assetId}`;
      await fs.writeFile(`${locname}.rbxmx`, fileBuffer);
      
      await exe(`./lune run convert ${locname}.rbxmx ${locname}.rbxm`);
      const converted = await fs.readFile(`${locname}.rbxm`);
      res.send(converted);
      fs.rm(`${locname}.rbxmx`);
      fs.rm(`${locname}.rbxm`);
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
