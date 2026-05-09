import * as nbt from "https://esm.sh/prismarine-nbt@2.7.0";

const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const parseBtn = document.getElementById("parseBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const output = document.getElementById("output");
const statusEl = document.getElementById("status");

let lastJson = "";
let lastFileName = "converted";

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

function hasGzipSignature(bytes) {
  return bytes?.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
}

function decompressIfNeeded(bytes) {
  if (!hasGzipSignature(bytes)) {
    return bytes;
  }

  try {
    return window.pako.ungzip(bytes);
  } catch (error) {
    throw new Error(`Falha ao descomprimir GZIP: ${error.message}`);
  }
}

function parseNbtWithCallback(bytes) {
  return new Promise((resolve, reject) => {
    nbt.parse(bytes, (error, parsedData) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(parsedData);
    });
  });
}

function bigintReplacer(_key, value) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  return value;
}

async function parseFileToJson(file) {
  const buffer = await readAsArrayBuffer(file);
  const rawBytes = new Uint8Array(buffer);
  const nbtBytes = decompressIfNeeded(rawBytes);

  const parsed = await parseNbtWithCallback(nbtBytes);

  // Remove wrappers de tipo para retornar JSON limpo (chave: valor).
  const cleanData = nbt.simplify(parsed);

  return JSON.stringify(cleanData, bigintReplacer, 2);
}

function getDownloadName(fileName) {
  const clean = fileName.replace(/\.[^/.]+$/, "");
  return `${clean || "converted"}.json`;
}

function updateFileSelection(file) {
  if (!file) {
    return;
  }

  lastFileName = file.name;
  setStatus(`Arquivo selecionado: ${file.name}`);
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  updateFileSelection(file);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("drag-over");

  const file = event.dataTransfer?.files?.[0];
  if (!file) {
    return;
  }

  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput.files = dt.files;
  updateFileSelection(file);
});

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
    lastFileName = file.name;
    output.textContent = json;
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
    setStatus("Arquivo convertido com sucesso.", "success");
  } catch (error) {
    output.textContent = "{}";
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    lastJson = "";
    setStatus(`Erro ao converter: ${error.message}`, "error");
  } finally {
    parseBtn.disabled = false;
  }
});

downloadBtn.addEventListener("click", () => {
  if (!lastJson) {
    return;
  }

  const blob = new Blob([lastJson], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = getDownloadName(lastFileName);
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
  setStatus("JSON baixado com sucesso.", "success");
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
