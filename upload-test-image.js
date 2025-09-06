import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function uploadImage() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YmIwZDdkMTJlYWM1OGRlM2I3OTYzNyIsImNvbGxlY3Rpb24iOiJ1c2VycyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInNpZCI6IjRmOGRjOWM1LTllNDAtNDAxYy1iYThjLTEwMDFhYzEwMDc5NCIsImlhdCI6MTc1NzA4OTE0OSwiZXhwIjoxNzU3MDk2MzQ5fQ.qZ66uNH5DxYEF4EZ9_oXo8NGr_rRERSuwqXbR9Xyz4Q';
    
    const form = new FormData();
    form.append('file', fs.createReadStream('tests/test-data/character-image.jpg'));
    form.append('alt', 'Aria Shadowbane Master Reference Image');
    
    const response = await fetch('http://localhost:3001/api/media', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    const result = await response.json();
    console.log('Upload result:', JSON.stringify(result, null, 2));
    
    if (result.doc && result.doc.id) {
      console.log('SUCCESS: Media uploaded with ID:', result.doc.id);
      return result.doc.id;
    } else {
      console.log('FAILED: Upload failed');
      return null;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

uploadImage();
