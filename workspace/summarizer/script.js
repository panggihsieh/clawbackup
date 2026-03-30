const materialText = document.querySelector("#materialText");
const pdfInput = document.querySelector("#pdfInput");
const fileName = document.querySelector("#fileName");
const pdfStatus = document.querySelector("#pdfStatus");
const summarizeBtn = document.querySelector("#summarizeBtn");
const clearBtn = document.querySelector("#clearBtn");
const summaryOutput = document.querySelector("#summaryOutput");
const summaryStatus = document.querySelector("#summaryStatus");
const speakBtn = document.querySelector("#speakBtn");
const stopBtn = document.querySelector("#stopBtn");

let latestSummary = "";

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";
}

pdfInput.addEventListener("change", handlePdfUpload);
summarizeBtn.addEventListener("click", summarizeMaterial);
clearBtn.addEventListener("click", clearAll);
speakBtn.addEventListener("click", speakSummary);
stopBtn.addEventListener("click", stopSpeaking);

async function handlePdfUpload(event) {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  fileName.textContent = file.name;
  pdfStatus.textContent = "PDF 读取中...";

  try {
    const text = await extractPdfText(file);
    materialText.value = text.trim();
    pdfStatus.textContent = "PDF 内容已载入";
  } catch (error) {
    pdfStatus.textContent = "PDF 读取失败";
    summaryStatus.textContent = "请确认浏览器可加载 PDF.js";
    console.error(error);
  }
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js 未加载");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    pages.push(pageText);
  }

  return pages.join("\n\n");
}

async function summarizeMaterial() {
  const source = materialText.value.trim();

  if (!source) {
    summaryStatus.textContent = "请先输入教材内容";
    summaryOutput.textContent = "请贴上文字或上传 PDF 后，再生成摘要。";
    return;
  }

  summarizeBtn.disabled = true;
  summaryStatus.textContent = "正在分析教材重点...";
  summaryOutput.textContent = "系统正在整理内容，请稍候。";

  try {
    const summary = await generateSummary(source);
    latestSummary = summary;
    summaryOutput.textContent = summary;
    summaryStatus.textContent = "摘要已生成";
  } catch (error) {
    console.error(error);
    summaryOutput.textContent = "摘要生成失败，请稍后再试。";
    summaryStatus.textContent = "发生错误";
  } finally {
    summarizeBtn.disabled = false;
  }
}

async function generateSummary(source) {
  const cleaned = source.replace(/\s+/g, " ").trim();

  if ("ai" in window && typeof window.ai.summarizer?.create === "function") {
    try {
      const summarizer = await window.ai.summarizer.create({
        type: "key-points",
        format: "plain-text",
        length: "medium",
      });
      const aiSummary = await summarizer.summarize(cleaned);
      if (aiSummary?.trim()) {
        return `一、教材重点\n${aiSummary.trim()}`;
      }
    } catch (error) {
      console.warn("浏览器原生 AI 不可用，改用本地摘要逻辑。", error);
    }
  }

  return buildFallbackSummary(cleaned);
}

function buildFallbackSummary(text) {
  const sentences = text
    .split(/(?<=[。！？.!?\n])/)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length >= 12);

  const keywords = extractKeywords(text);
  const scoredSentences = sentences.map((sentence, index) => ({
    sentence,
    index,
    score: scoreSentence(sentence, keywords, index),
  }));

  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .sort((a, b) => a.index - b.index)
    .map((item) => `• ${item.sentence}`);

  const keywordLine = keywords.length
    ? keywords.slice(0, 8).join("、")
    : "教材主旨、关键概念、课堂应用";

  const intro = sentences[0] || "这份教材内容涵盖多个教学重点。";
  const conclusion =
    sentences.find((sentence) => /总结|因此|所以|综上|总之/.test(sentence)) ||
    "建议课堂中先引导学生掌握核心概念，再搭配实例说明与复习提问。";

  return [
    "一、教材核心概念",
    `本份教材主要围绕：${keywordLine}。`,
    "",
    "二、重点摘要",
    ...topSentences,
    "",
    "三、教学建议",
    `• 导入方向：${trimSentence(intro)}`,
    `• 课堂收束：${trimSentence(conclusion)}`,
  ].join("\n");
}

function extractKeywords(text) {
  const matches = text.match(/[\u4e00-\u9fffA-Za-z]{2,}/g) || [];
  const stopWords = new Set([
    "我们",
    "你们",
    "他们",
    "这个",
    "可以",
    "进行",
    "以及",
    "一个",
    "什么",
    "因为",
    "所以",
    "学生",
    "老师",
    "课程",
    "内容",
    "教材",
    "学习",
  ]);

  const frequency = new Map();

  matches.forEach((word) => {
    const normalized = word.toLowerCase();
    if (normalized.length < 2 || stopWords.has(normalized)) {
      return;
    }
    frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
  });

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word);
}

function scoreSentence(sentence, keywords, index) {
  const keywordScore = keywords.reduce(
    (total, keyword) => total + (sentence.toLowerCase().includes(keyword) ? 2 : 0),
    0
  );
  const lengthScore = Math.min(sentence.length / 28, 4);
  const positionScore = index === 0 ? 2 : index < 3 ? 1 : 0;
  return keywordScore + lengthScore + positionScore;
}

function trimSentence(sentence) {
  return sentence.length > 70 ? `${sentence.slice(0, 70)}...` : sentence;
}

function speakSummary() {
  const content = latestSummary || summaryOutput.textContent.trim();

  if (!content || content.includes("系统会在这里显示")) {
    summaryStatus.textContent = "请先生成摘要";
    return;
  }

  if (!("speechSynthesis" in window)) {
    summaryStatus.textContent = "当前浏览器不支持 Web Speech API";
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = "zh-TW";
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onstart = () => {
    summaryStatus.textContent = "正在播放语音摘要";
  };

  utterance.onend = () => {
    summaryStatus.textContent = "语音播放完成";
  };

  utterance.onerror = () => {
    summaryStatus.textContent = "语音播放失败";
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    summaryStatus.textContent = "已停止语音播放";
  }
}

function clearAll() {
  materialText.value = "";
  pdfInput.value = "";
  fileName.textContent = "尚未选择文件";
  pdfStatus.textContent = "等待上传";
  summaryStatus.textContent = "尚未生成摘要";
  summaryOutput.textContent = "系统会在这里显示教材重点整理结果。";
  latestSummary = "";
  stopSpeaking();
}
