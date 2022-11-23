import fs from 'fs';
import satori from 'satori';
import { html } from 'satori-html';
import { fastify } from 'fastify';
import { renderAsync } from '@resvg/resvg-js';
import axios from 'axios';
import sizeOf from 'image-size';

const app = fastify();

const fetchImageData = async (url) => {
  try {
    const imgRes = await axios.get(url, { responseType: 'arraybuffer' });
    const { width, height } = fitSize(sizeOf(imgRes.data), 400, 160);

    return {
      url: `data:image/png;base64,${imgRes.data.toString('base64')}`,
      width,
      height
    };
  } catch (e) {
    return null
  }
}

const makeMarkupForSatori = async (logo) =>  {
  const imageData = logo ? await fetchImageData(logo) : null;

  if (imageData) {
    return html`<!DOCTYPE html>
      <html lang="en">
        <head>
          <style>
            body {
              font-family: 'Graphik';
              font-weight: normal;
              font-style: normal;
              text-align: left;
              height: 100vh;
              width: 100%;
              display: flex;
              flex-direction: column;
              color: #38343F;
              background: #FFF;
            }

            h1 {
              font-family: 'Graphik-Bold';
              font-size: 70px;
              line-height: 75px;
            }

            .container {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 80px 100px 70px;
              flex: 1 0 0;
            }

            .caption {
              font-size: 40px;
              line-height: 45px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .logo {
              max-width: 400px;
              max-height: 160px;
              object-fit: contain;
              object-position: left;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img
              class="logo"
              src="${imageData.url}"
              width="${imageData.width}"
              height="${imageData.height}"
              />
            <h1>Заг</h1>
          </div>
        </body>
      </html>
      `;
  }

  return html`<!DOCTYPE html>
      <html lang="en">
        <head>
          <style>
            body {
              font-family: 'Graphik';
              font-weight: normal;
              font-style: normal;
              text-align: left;
              height: 100vh;
              width: 100%;
              display: flex;
              flex-direction: column;
              color: #38343F;
              background: #FFF;
            }

            h1 {
              font-family: 'Graphik-Bold';
              font-size: 70px;
              line-height: 75px;
            }

            .container {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 80px 100px 70px;
              flex: 1 0 0;
              width: 100%;
            }

            .caption {
              font-size: 40px;
              line-height: 45px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
            }

            .logo {
              max-width: 400px;
              max-height: 160px;
              object-fit: contain;
              object-position: left;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="caption">organizationName</div>
            <h1>Заг</h1>
          </div>
        </body>
      </html>
      `;
};

const graphikRegular = fs.readFileSync('./Graphik-Regular-Web.woff');
const graphikBold = fs.readFileSync('./Graphik-Bold-Web.woff');

function fitSize({ width, height }, dw, dh) {
  const sAr = width / height;
  const dAr = dw / dh;

  if (sAr < dAr) {
    return { width: dh * sAr, height: dh};
  }

  return { width: dw, height: dw / sAr};
}

app.get('/img-satori', async (request, reply) => {
  try {
    const svg = await satori(await makeMarkupForSatori('https://master-store.huntflow.dev/uploads/named/public/f/6/b/f6b9500be57549c8cf7d9802d79e5431.png/retina-logo-new.png?s=hjnh5QAZQYopwZ4frcXcbg&e=1666300176'), {
      width: 1200,
      height: 630,
      fonts: [
        {
          data: graphikRegular,
          name: 'Graphik'
        },
        {
          data: graphikBold,
          name: 'Graphik-Bold'
        }
      ],
    });
    const res = await renderAsync(svg);
    reply.header('Content-Type', 'image/png');
    reply.send(res.asPng());
  } catch (err) {
    reply.send('shit');
    console.log(err);
  }
});

app.listen({
  port: 3000
});