const fileInput = document.querySelector("#fileInput");
const dropzone = document.querySelector("#dropzone");
const fileMeta = document.querySelector("#fileMeta");
const preview = document.querySelector("#preview");
const statusMessage = document.querySelector("#statusMessage");
const convertButton = document.querySelector("#convertButton");
const downloadButton = document.querySelector("#downloadButton");

let selectedFile = null;
let extractedHtml = "";
let generatedPdfBlob = null;
let generatedFileName = "converted.pdf";

const setStatus = (message, type = "") => {
  statusMessage.textContent = message;
  statusMessage.className = `status${type ? ` is-${type}` : ""}`;
};

const escapeHtml = (text) =>
  text.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });

const renderPlaceholder = () => {
  preview.innerHTML = `
    <div class="preview__placeholder">
      上傳檔案後，這裡會顯示轉換後的文字與段落。
    </div>
  `;
};

const resetGeneratedPdf = () => {
  generatedPdfBlob = null;
  downloadButton.disabled = true;
};

const setSelectedFile = (file) => {
  selectedFile = file;
  extractedHtml = "";
  resetGeneratedPdf();

  if (!file) {
    fileMeta.innerHTML = `<span class="file-meta__label">目前尚未選擇檔案</span>`;
    convertButton.disabled = true;
    renderPlaceholder();
    setStatus("請先上傳 `.docx` 檔案。");
    return;
  }

  const sizeInKb = (file.size / 1024).toFixed(1);
  fileMeta.innerHTML = `
    <span class="file-meta__label">檔名：${escapeHtml(file.name)}</span>
    <span class="file-meta__label">大小：${sizeInKb} KB</span>
  `;
  convertButton.disabled = false;
  preview.innerHTML = `
    <div class="preview__placeholder">
      已選擇檔案，按下「轉換成 PDF」開始處理。
    </div>
  `;
  setStatus("檔案已載入，準備開始轉換。");
};

const handleFileSelection = (file) => {
  if (!file) {
    setSelectedFile(null);
    return;
  }

  if (!file.name.toLowerCase().endsWith(".docx")) {
    setSelectedFile(null);
    setStatus("請選擇 `.docx` Word 檔案。", "error");
    return;
  }

  setSelectedFile(file);
};

fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  handleFileSelection(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragover");
  });
});

dropzone.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  handleFileSelection(file);
});

const buildPdf = async (htmlContent, fileName) => {
  // Create a hidden container for rendering
  const container = document.createElement("div");
  container.id = "pdf-render-container";
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 595pt;
    font-family: "Noto Sans TC", "思源黑體", "Source Han Sans", sans-serif;
    font-size: 12pt;
    line-height: 1.6;
    padding: 40pt;
    background: white;
    color: black;
  `;
  
  // Clean up any existing container
  const existing = document.getElementById("pdf-render-container");
  if (existing) existing.remove();
  
  document.body.appendChild(container);
  container.innerHTML = htmlContent;

  const opt = {
    margin: [40, 40, 40, 40],
    filename: fileName.replace(/\.docx$/i, ".pdf") || "converted.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { 
      unit: "pt", 
      format: "a4", 
      orientation: "portrait" 
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] }
  };

  return html2pdf().set(opt).from(container).outputPdf("blob");
};

convertButton.addEventListener("click", async () => {
  if (!selectedFile) {
    setStatus("請先選擇要轉換的 `.docx` 檔案。", "error");
    return;
  }

  try {
    convertButton.disabled = true;
    downloadButton.disabled = true;
    setStatus("正在解析 Word 檔案與建立 PDF，請稍候...");

    const arrayBuffer = await selectedFile.arrayBuffer();
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });

    const warnings = htmlResult.messages;
    const cleanHtml = htmlResult.value.trim();

    if (!cleanHtml) {
      throw new Error("文件內容為空，無法建立 PDF。");
    }

    extractedHtml = cleanHtml;
    generatedPdfBlob = await buildPdf(extractedHtml, selectedFile.name);
    generatedFileName = selectedFile.name.replace(/\.docx$/i, ".pdf") || "converted.pdf";

    preview.innerHTML = `
      <article class="preview-content">
        ${htmlResult.value || "<p>沒有可顯示的內容。</p>"}
      </article>
    `;

    downloadButton.disabled = false;

    if (warnings.length > 0) {
      setStatus("已完成轉換，部分格式可能與原始 Word 不完全一致。", "success");
    } else {
      setStatus("轉換完成，現在可以下載 PDF。", "success");
    }
  } catch (error) {
    console.error(error);
    resetGeneratedPdf();
    setStatus(error.message || "轉換失敗，請確認檔案格式是否正確。", "error");
  } finally {
    convertButton.disabled = !selectedFile;
    
    // Clean up hidden container
    const container = document.getElementById("pdf-render-container");
    if (container) container.remove();
  }
});

downloadButton.addEventListener("click", () => {
  if (!generatedPdfBlob) {
    setStatus("目前沒有可下載的 PDF，請先完成轉換。", "error");
    return;
  }

  const url = URL.createObjectURL(generatedPdfBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = generatedFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  setStatus("PDF 已開始下載。", "success");
});

renderPlaceholder();