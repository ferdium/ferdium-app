const submitBtn = document.querySelector('#submit');
const fileInput = document.querySelector('#file');
const fileOutput = document.querySelector('#fileoutput');

fileInput.addEventListener('change', () => {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const text = reader.result;
    if (fileOutput) {
      fileOutput.value = text;
    }
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  });
  // eslint-disable-next-line unicorn/prefer-blob-reading-methods
  reader.readAsText(fileInput.files[0]);
});
