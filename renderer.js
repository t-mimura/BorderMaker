// renderer.js
const { ipcRenderer } = require('electron');

const selectImagesBtn = document.getElementById('select-images-btn');
const selectedFilesList = document.getElementById('selected-files-list');

selectImagesBtn.addEventListener('click', () => {
  ipcRenderer.send('open-file-dialog');
});

// Border configuration
const blackBorderInput = document.getElementById('black-border-thickness');
const whiteBorderInput = document.getElementById('white-border-thickness');

// Image Preview elements
const imagePreview = document.getElementById('image-preview');
const previewPlaceholder = document.getElementById('preview-placeholder');
let currentPreviewImagePath = null;

function getBorderValues() {
  let black = parseInt(blackBorderInput.value, 10);
  let white = parseInt(whiteBorderInput.value, 10);

  black = Number.isFinite(black) && black >= 0 ? black : 0;
  white = Number.isFinite(white) && white >= 0 ? white : 0;
  
  return { blackThickness: black, whiteThickness: white };
}

// Helper function to get MIME type and extension
function getImageType(imagePath) {
  const extension = imagePath.substring(imagePath.lastIndexOf('.')).toLowerCase();
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return { mimeType: 'image/jpeg', extension: extension };
    case '.png':
      return { mimeType: 'image/png', extension: extension };
    case '.webp':
      return { mimeType: 'image/webp', extension: extension };
    default:
      return { mimeType: 'image/png', extension: '.png' };
  }
}

function applyBordersToImage(imageSrc, blackThickness, whiteThickness, mimeType, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const originalWidth = image.width;
      const originalHeight = image.height;

      const newWidth = originalWidth + 2 * (blackThickness + whiteThickness);
      const newHeight = originalHeight + 2 * (blackThickness + whiteThickness);

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, newWidth, newHeight);

      ctx.fillStyle = 'black';
      ctx.fillRect(
        whiteThickness,
        whiteThickness,
        newWidth - 2 * whiteThickness,
        newHeight - 2 * whiteThickness
      );

      ctx.drawImage(
        image,
        whiteThickness + blackThickness,
        whiteThickness + blackThickness
      );

      if (mimeType === 'image/jpeg' || mimeType === 'image/webp') {
        resolve(canvas.toDataURL(mimeType, quality));
      } else {
        resolve(canvas.toDataURL(mimeType)); // Defaults to image/png if mimeType is not supported for encoding
      }
    };
    image.onerror = (err) => {
      console.error("Failed to load image for processing:", imageSrc, err);
      reject(new Error('Failed to load image: ' + imageSrc));
    };
    image.src = imageSrc; // For file paths, Electron with nodeIntegration handles file:// URLs
  });
}

function updatePreview() {
  if (!currentPreviewImagePath) {
    imagePreview.style.display = 'none';
    previewPlaceholder.style.display = 'block';
    previewPlaceholder.textContent = 'Select an image to see a preview.';
    return;
  }

  const { blackThickness, whiteThickness } = getBorderValues();
  const black = Number.isFinite(blackThickness) && blackThickness >= 0 ? blackThickness : 0;
  const white = Number.isFinite(whiteThickness) && whiteThickness >= 0 ? whiteThickness : 0;

  previewPlaceholder.textContent = 'Generating preview...';
  previewPlaceholder.style.display = 'block';
  imagePreview.style.display = 'none';

  applyBordersToImage(currentPreviewImagePath, black, white)
    .then(dataUrl => {
      imagePreview.src = dataUrl;
      imagePreview.style.display = 'block';
      previewPlaceholder.style.display = 'none';
    })
    .catch(error => {
      console.error('Error updating preview:', error);
      imagePreview.style.display = 'none';
      previewPlaceholder.style.display = 'block';
      previewPlaceholder.textContent = 'Error generating preview.';
    });
}

ipcRenderer.on('selected-files', (event, files) => {
  if (files && files.length > 0) {
    console.log('Selected files:', files);
    selectedFilesList.innerHTML = '<h3>Selected Images:</h3><ul>' +
                                  files.map(file => `<li>${file}</li>`).join('') +
                                  '</ul>';
    currentPreviewImagePath = files[0]; // Use the first image for preview
  } else {
    console.log('No files selected.');
    selectedFilesList.innerHTML = '<p>No images selected.</p>';
    currentPreviewImagePath = null;
  }
  updatePreview(); // Update preview when selection changes
});

blackBorderInput.addEventListener('change', () => {
  // const { blackThickness, whiteThickness } = getBorderValues(); // Already called in updatePreview
  // console.log(`Border values changed: Black: ${blackThickness}px, White: ${whiteThickness}px`);
  updatePreview(); // Update preview when border value changes
});

whiteBorderInput.addEventListener('change', () => {
  // const { blackThickness, whiteThickness } = getBorderValues(); // Already called in updatePreview
  // console.log(`Border values changed: Black: ${blackThickness}px, White: ${whiteThickness}px`);
  updatePreview(); // Update preview when border value changes
});

// Initial call to set placeholder correctly if no image is auto-selected
updatePreview();

// Output Folder Selection
const selectOutputFolderBtn = document.getElementById('select-output-folder-btn');
const selectedOutputFolderDisplay = document.getElementById('selected-output-folder');
let outputFolderPath = null;

// Process and Save Button & Status
const processSaveBtn = document.getElementById('process-save-btn');
const processingStatus = document.getElementById('processing-status');
let currentSelectedImagePaths = []; // To store all selected image paths

ipcRenderer.on('selected-files', (event, files) => {
  if (files && files.length > 0) {
    currentSelectedImagePaths = files; // Store all selected files
    console.log('Selected files:', files);
    selectedFilesList.innerHTML = '<h3>Selected Images:</h3><ul>' +
                                  files.map(file => `<li>${file}</li>`).join('') +
                                  '</ul>';
    currentPreviewImagePath = files[0]; // Use the first image for preview
  } else {
    currentSelectedImagePaths = [];
    console.log('No files selected.');
    selectedFilesList.innerHTML = '<p>No images selected.</p>';
    currentPreviewImagePath = null;
  }
  updatePreview(); // Update preview when selection changes
});


selectOutputFolderBtn.addEventListener('click', () => {
  ipcRenderer.send('open-output-folder-dialog');
});

ipcRenderer.on('output-folder-selected', (event, folderPath) => {
  if (folderPath && folderPath.length > 0) {
    const actualPath = Array.isArray(folderPath) ? folderPath[0] : folderPath;
    outputFolderPath = actualPath;
    selectedOutputFolderDisplay.textContent = actualPath;
    console.log('Output folder selected:', actualPath);
  } else {
    console.log('Output folder selection cancelled or no folder chosen.');
  }
});

processSaveBtn.addEventListener('click', async () => {
  if (!currentSelectedImagePaths || currentSelectedImagePaths.length === 0) {
    processingStatus.textContent = 'Error: Please select images first.';
    setTimeout(() => { if(processingStatus.textContent === 'Error: Please select images first.') processingStatus.textContent = ''; }, 5000);
    return;
  }
  if (!outputFolderPath) {
    processingStatus.textContent = 'Error: Please select an output folder first.';
    setTimeout(() => { if(processingStatus.textContent === 'Error: Please select an output folder first.') processingStatus.textContent = ''; }, 5000);
    return;
  }

  processSaveBtn.disabled = true; // Disable button
  processingStatus.textContent = 'Starting processing...';

  const { blackThickness, whiteThickness } = getBorderValues();
  let successCount = 0;
  let errorCount = 0;
  const totalImages = currentSelectedImagePaths.length;

  for (let i = 0; i < totalImages; i++) {
    const imagePath = currentSelectedImagePaths[i];
    // Updated filename extraction to handle both / and \
    const originalFileNameWithExt = imagePath.substring(imagePath.lastIndexOf(/[\/\\]/) + 1);
    processingStatus.textContent = `Processing image ${i + 1} of ${totalImages}: ${originalFileNameWithExt}...`;

    const { mimeType, extension: originalExtension } = getImageType(imagePath); // Get type

    try {
      // Pass mimeType to applyBordersToImage
      const dataUrl = await applyBordersToImage(imagePath, blackThickness, whiteThickness, mimeType);
      
      // Use originalExtension for the new filename
      const baseNameWithoutExt = originalFileNameWithExt.substring(0, originalFileNameWithExt.length - originalExtension.length);
      const newFileName = `${baseNameWithoutExt}_bordered${originalExtension}`;

      const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
      
      ipcRenderer.send('save-image', { buffer, newFileName, outputFolderPath, originalPath: imagePath });
      successCount++;
    } catch (error) {
      console.error(`Error processing ${imagePath}:`, error);
      errorCount++;
    }
  }

  let finalMessage = '';
  if (errorCount > 0) {
    finalMessage = `Processing complete. ${successCount} of ${totalImages} images saved. ${errorCount} errors. Check console for details.`;
  } else {
    finalMessage = `Processing complete! All ${successCount} images saved successfully to ${outputFolderPath}.`;
  }
  processingStatus.textContent = finalMessage;
  // setTimeout(() => { processingStatus.textContent = ''; }, 10000); 

  processSaveBtn.disabled = false; // Re-enable button
});
