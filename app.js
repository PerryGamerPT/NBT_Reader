import { read } from "https://cdn.jsdelivr.net/npm/nbtify@2.2.0/+esm";

const fileInput = document.getElementById("fileInput");
const parseBtn = document.getElementById("parseBtn");
const copyBtn = document.getElementById("copyBtn");
const output = document.getElementById("output");
const statusEl = document.getElementById("status");

let lastJson = "";

function setStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.classList.remove("success", "error");

  if (type === "success") {
    statusEl.classList.add("success");
  } else if (type === "error") {
    statusEl.classList.add("error");
  }
}

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));

    reader.readAsArrayBuffer(file);
  });
}

function tryDecompressGzip(uint8Array) {
  try {
    return window.pako.ungzip(uint8Array);
  } catch {
    return uint8Array;
  }
}

function normalizeBigInt(value) {
  if (typeof value === "bigint") {
    return `${value.toString()}n`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeBigInt(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, normalizeBigInt(val)])
    );
  }

  return value;
}

async function parseFileToJson(file) {
  const buffer = await readAsArrayBuffer(file);
  const uint8 = new Uint8Array(buffer);
  const processed = tryDecompressGzip(uint8);

  const nbtData = await read(processed);
  const safeData = normalizeBigInt(nbtData);

  return JSON.stringify(safeData, null, 2);
}

parseBtn.addEventListener("click", async () => {
  const file = fileInput.files?.[0];

  if (!file) {
    setStatus("Selecione um arquivo .dat antes de converter.", "error");
    return;
  }

  setStatus("Lendo e convertendo arquivo...");
  parseBtn.disabled = true;

  try {
    const json = await parseFileToJson(file);

    lastJson = json;
    output.textContent = json;
    copyBtn.disabled = false;
    setStatus("Arquivo convertido com sucesso.", "success");
  } catch (error) {
    output.textContent = "{}";
    copyBtn.disabled = true;
    lastJson = "";
    setStatus(`Erro ao converter: ${error.message}`, "error");
  } finally {
    parseBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", async () => {
  if (!lastJson) {
    return;
  }

  try {
    await navigator.clipboard.writeText(lastJson);
    setStatus("JSON copiado para a area de transferencia.", "success");
  } catch {
    setStatus("Nao foi possivel copiar automaticamente. Copie manualmente.", "error");
  }
});
