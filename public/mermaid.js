import app from './app.js';
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

// 初期設定
mermaid.initialize({ 
    startOnLoad: false,
    theme: 'default' 
});

document.addEventListener('DOMContentLoaded', async () => {

    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const outputButton = document.getElementById('output-button');
    const sendButton = document.getElementById('send-button');
    const downloadButton = document.getElementById('download-button');
    const resultSpaceElement = document.getElementById('result-space');
    const formElement = document.getElementById('form');
    const clearButton = document.getElementById('clear-button');
    const umlTypeSelectElement = document.getElementById('uml-type-select');
    const defaultPromptElement = document.getElementById('default-prompt');

    outputButton.addEventListener('click', async () => {
        let result = await renderChart();
        if (!result) return ;
        showResultSpace();
    });

    downloadButton.addEventListener('click', async () => {
        await downloadMermaidImage();
    });

    formElement.addEventListener('submit', async(e) => {
      e.preventDefault();
      let response = await getChatGptMermaidResponse();
      console.log(response, "AIからの応答");
      response = cleanMermaidCode(response);
  
      editor.value = response;
      renderChart();
      showResultSpace();
    });

    sendButton.addEventListener('click', async () => {
    });

    clearButton.addEventListener('click', async () => {
      editor.value = "";
      preview.innerHTML = "";
    });

    umlTypeSelectElement.addEventListener('change', (e) => {
      defaultPromptElement.textContent = `既定指示文：${e.target.selectedOptions[0].dataset.mainPrompt}`;
    });

    createUmlTypeOptions(umlTypeSelectElement);

    // 描画用の関数
    const renderChart = async () => {
        const code = editor.value;
        try {
            // render(ID, ソースコード)
            const { svg } = await mermaid.render('mermaid-svg', code);
            preview.innerHTML = svg;
            return true;
        } catch (error) {
            // 文法エラー時はコンソールに出す（または画面にエラー表示）
            console.error("Syntax Error:", error);
            return false;
        }
    };

    let showResultSpace = () => {
      resultSpaceElement.classList.remove('hide');
    };
});

let getChatGptMermaidResponse = async () => {
  let description_prompt = document.getElementById('prompt-input-area')?.value.trim();
  let model = "gpt-4o-mini";

  const umlTypeSelectElement = document.getElementById('uml-type-select');
  const selectedDataset = umlTypeSelectElement.selectedOptions[0].dataset;
  const defaultPromptElement = document.getElementById('default-prompt');

  let final_prompt = defaultPromptElement.textContent + description_prompt;
  let uml_type = umlTypeSelectElement.value;

  const token = localStorage.getItem("token");

  let is_loading = true;
  setLoadingModal(is_loading);

  try {
    const res = await fetch('api/chatGpt/mermaid', {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: final_prompt, model: model , uml_type: uml_type }),
    });

    const data = await res.json();
    const answer = data.reply.answer || "（応答を取得できませんでした）";
    is_loading = false;
    setLoadingModal(is_loading);
    return answer;
  }
  catch (error) {
    is_loading = false;
    setLoadingModal(is_loading);
    console.error(error);
    alert("サーバー側でエラーが発生しました。しばらくしてから再度お試しください。認証エラーの場合はログインし直してください。");
    throw new Error("サーバー側でエラーが発生しました。");
  }
};

let cleanMermaidCode = (aiResponse) => {
    // 1. ```mermaid と ``` の間にある文字列を抽出する正規表現
    const regex = /```mermaid\s*\n([\s\S]*?)```/;
    const match = aiResponse.match(regex);

    if (match && match[1]) {
        // 2. 抽出できた場合、前後の不要な空白を削除して返す
        return match[1].trim();
    }

    // 3. 万が一 ```mermaid がない場合、コードブロックだけの囲いを探す
    const simpleRegex = /```\n?([\s\S]*?)```/;
    const simpleMatch = aiResponse.match(simpleRegex);
    if (simpleMatch && simpleMatch[1]) {
        return simpleMatch[1].trim();
    }

    // 4. どちらにも該当しない場合、AIがコードだけを返したと判断して全文を返す
    return aiResponse.trim();
};
let downloadMermaidImage = async () => {
    const preview = document.getElementById('preview');
    const svgElement = preview.querySelector('svg');

    if (!svgElement) return;

    // 1. 実際の描画範囲（BBox）を取得
    const bBox = svgElement.getBBox();
    const viewBox = svgElement.viewBox.baseVal;
    
    // 2. 基本サイズを決定
    const baseWidth = viewBox.width || bBox.width;
    const baseHeight = viewBox.height || bBox.height;
    const minX = viewBox.x || bBox.x;
    const minY = viewBox.y || bBox.y;

    // 【重要】上下左右に10pxずつの余白（パディング）を設定
    const padding = 20; 

    const canvas = document.createElement("canvas");
    const scale = 2; // 高解像度
    
    // キャンバスサイズをパディング分大きくする
    canvas.width = (baseWidth + padding * 2) * scale;
    canvas.height = (baseHeight + padding * 2) * scale;
    
    const ctx = canvas.getContext("2d");

    // 3. SVGをクローンし、サイズを調整
    const clonedSvg = svgElement.cloneNode(true);
    clonedSvg.setAttribute("width", baseWidth);
    clonedSvg.setAttribute("height", baseHeight);
    clonedSvg.style.backgroundColor = "white";

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
        // 背景を白で塗りつぶす
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.scale(scale, scale);
        
        // 【修正ポイント】パディング分だけさらに内側に移動させる
        // これで端の線が切れるのを防ぎます
        ctx.translate(-minX + padding, -minY + padding);
        
        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `mermaid_perfect_${Date.now()}.png`;
        link.click();

        URL.revokeObjectURL(url);
    };
    img.src = url;
};


let setLoadingModal = (isLoading) => {
  const body = document.body;
  const loadingModalElement = document.getElementById('loading-modal');

  if (isLoading) {
    loadingModalElement.classList.remove('hide');
    loadingModalElement.classList.add('show');
    body.classList.add('no-scroll');
  } else {
    loadingModalElement.classList.remove('show');
    loadingModalElement.classList.add('hide') ;
    body.classList.remove('no-scroll');
  }
};


let createUmlTypeOptions = (selectElement) => {
  app.data.umlTypes.forEach(umlType => {
    const option = document.createElement('option');
    option.value = umlType.value;
    option.textContent = umlType.label;
    option.dataset.mainPrompt = umlType.main_prompt;
    selectElement.appendChild(option);
  });
    const event = new Event('change', { bubbles: true });
    selectElement.dispatchEvent(event);
};

