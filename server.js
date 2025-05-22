const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));

app.post('/upload', (req, res) => {
  const dataURL = req.body.image;
  const filename = req.body.filename || `image_${Date.now()}.jpg`;
  const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
  const filePath = path.join(__dirname, 'public', 'uploads', filename);
  fs.writeFile(filePath, base64Data, 'base64', err => {
    if (err) return res.status(500).send('保存失敗');
    res.send('保存完了: ' + filename);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
