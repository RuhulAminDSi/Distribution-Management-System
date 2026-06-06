import { Router } from 'express';
import { generateOGImage } from '../utils/ogImage.js';

const router = Router();

let cachedImage = null;

router.get('/og-image.png', (req, res) => {
  if (!cachedImage) {
    cachedImage = generateOGImage();
  }
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(cachedImage);
});

export default router;
