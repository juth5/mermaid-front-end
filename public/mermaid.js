import app from './app.js';
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';



mermaid.initialize({ 
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose', // これを追加
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
    const umlTypeImage = document.getElementById('uml-type-image');
    const imageDialog = document.getElementById('image-dialog');
    const closeBtn = document.getElementById('closeBtn');
    const previewImage = document.getElementById('preview-image');
    const formatPromptElement = document.getElementById('format-prompt');
    const promptCopyButton = document.getElementById('prompt-copy-button');
    const copyCodeButton = document.getElementById('copy-code-button');
    const umtTypeDescriptionElement = document.getElementById('uml-type-description');
    const umlTypeSubTitleElement = document.getElementById('uml-type-sub-title');
    const scaleButton = document.getElementById('scale-button');
    const promptExampleTitleElement = document.getElementById('prompt-example-title');
    const formatPromptExampleElement = document.getElementById('format-prompt-example');

    outputButton.addEventListener('click', async () => {
        let result = await renderChart();
        if (!result) return ;
        showResultSpace();
        // ページの最下部までスクロール
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth' // じわっと動かしたい場合は 'smooth'、一瞬で飛ばすなら 'auto'
        });
    });

    downloadButton.addEventListener('click', async () => {
        downloadViaKroki(editor.value);
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

    clearButton.addEventListener('click', async () => {
      editor.value = "";
      preview.innerHTML = "";
      editor.focus();
    });

    let changeUmlTypeImage = (umlTypeValue) => {
      umlTypeImage.src = `/assets/image/${umlTypeValue}.png`;
    };

    promptCopyButton.addEventListener('click', () => {
      const textToCopy = formatPromptElement.textContent;
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          alert("プロンプトがコピーされました！");
        })
        .catch(err => {
          console.error("コピーに失敗しました:", err);
          alert("コピーに失敗しました。ブラウザの設定を確認してください。");
        });
    });

    copyCodeButton.addEventListener('click', () => {
      const codeToCopy = editor.value;
      navigator.clipboard.writeText(codeToCopy)
        .then(() => {
          alert("コードがコピーされました！");
        })
        .catch(err => {
          console.error("コピーに失敗しました:", err);
          alert("コピーに失敗しました。ブラウザの設定を確認してください。");
        });
    });

    let setFormatPrompt = (umlTypeValue) => {
      formatPromptElement.textContent = "";
      let main_prompt = app.data.chartTypeOptions.find(type => type.value === umlTypeValue)?.main_prompt || "";
      let promptText = `mermaidで${main_prompt}`;      
      formatPromptElement.textContent = promptText;
    };

    let setFormatPromptTitle = (umlTypeValue) => {
      let umlTypeLabel = app.data.chartTypeOptions.find(type => type.value === umlTypeValue)?.label || "";
      promptExampleTitleElement.textContent = `${umlTypeLabel}のプロンプト例（上記のプロンプトを含めて、以下を参考にしてAIに指示を出してください）`;
    };

    let setFormatPromptExample = (umlTypeValue) => {
      formatPromptExampleElement.textContent = "";
      let sample_prompt = app.data.chartTypeOptions.find(type => type.value === umlTypeValue)?.sample_prompt || "";
      formatPromptExampleElement.textContent = sample_prompt;
    };
    
    let setUmlTypeDescription = (umlTypeValue) => {
      umtTypeDescriptionElement.innerHTML = "";
      let descriptionList = app.data.chartTypeOptions.find(type => type.value === umlTypeValue)?.description || [];
      if (descriptionList.length > 0) {
        let ulElement = document.createElement('ul');
        descriptionList.forEach(desc => {
          let liElement = document.createElement('li');
          liElement.textContent = desc;
          ulElement.appendChild(liElement);
        });
        umtTypeDescriptionElement.appendChild(ulElement); 
      }
    };

    let setUmlTypeSubTitle = (umlTypeValue) => {
      let umlTypeLabel = app.data.chartTypeOptions.find(type => type.value === umlTypeValue)?.label || "";
      umlTypeSubTitleElement.textContent = `${umlTypeLabel}の例`;
    };

    umlTypeSelectElement.addEventListener('change', (e) => {
      console.log(e.target.value, "選択されたオプションのデータセット");
      changeUmlTypeImage(e.target.value);
      setFormatPrompt(e.target.value);
      // setUmlTypeDescription(e.target.value);
      setUmlTypeSubTitle(e.target.value);
      setFormatPromptTitle(e.target.value);
      setFormatPromptExample(e.target.value);
    });

    createUmlTypeOptions(umlTypeSelectElement);
    // 描画用の関数（修正版）
    const renderChart = async () => {
        const code = editor.value;
        if (!code) return false;

        try {
            // IDを一意にする（Date.now()などを使って重複を避けるのが安全です）
            const id = 'mermaid-svg-' + Date.now();
            
            // v10のrenderは第2引数にコードを渡します
            const { svg, bindFunctions } = await mermaid.render(id, code);
            
            preview.innerHTML = svg;

            // ズームなどのインタラクションがある図の場合、これを呼ぶ必要があります
            if (bindFunctions) {
                bindFunctions(preview);
            }
            
            return true;
        } catch (error) {
            console.error("Syntax Error:", error);
            // エラー時、ユーザーに通知するためにpreviewをクリアしたりメッセージを出したりする
            preview.innerHTML = `<p style="color:red;">文法エラーが発生しています。再度AIに指示を出してください。</p>`;
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

    // clonedSvg を作成した後にこれを追加
    clonedSvg.style.fontFamily = "Arial, sans-serif";
    const textElements = clonedSvg.querySelectorAll('text');
    textElements.forEach(text => {
        text.style.fontFamily = "Arial, sans-serif";
    });

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
  app.data.chartTypeOptions.forEach(umlType => {
    const option = document.createElement('option');
    option.value = umlType.value;
    option.textContent = umlType.label;
    option.dataset.mainPrompt = umlType.main_prompt;
    selectElement.appendChild(option);
  });
    const event = new Event('change', { bubbles: true });
    selectElement.dispatchEvent(event);
};

let downloadViaKroki = async (mermaidCode) => {
    try {
        // ★裏技：文字サイズを無理やり巨大化させる設定を先頭に追加
        // const giantConfig = `%%{init: {"themeVariables": {"fontSize": "36px"}}}%%\n`;

        const giantConfig = `%%{init: {"themeVariables": {"fontSize": "36px"}, "gantt": {"rightPadding": 400}}}%%\n`;


        const codeForKroki = giantConfig + mermaidCode;

        // 1. 文字列をUTF-8のバイト配列に変換（★結合した codeForKroki を使う）
        const bytes = new TextEncoder().encode(codeForKroki);

        // 2. CompressionStreamを使ってzlib(deflate)圧縮
        const cs = new CompressionStream('deflate');
        const writer = cs.writable.getWriter();
        writer.write(bytes);
        writer.close();

        // 3. 圧縮されたデータを取得
        const compressedBuffer = await new Response(cs.readable).arrayBuffer();
        
        // 4. Base64エンコード（URL安全な形式に変換）
        const base64 = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        // 5. Krokiのエンドポイント
        const apiUrl = `https://kroki.io/mermaid/png/${base64}`;
        
        // 動作確認用にログ出力
        console.log("Kroki URL:", apiUrl);

        // 別タブで開く、またはダウンロード処理
        const link = document.createElement("a");
        link.href = apiUrl;
        link.download = `mermaid_kroki_${Date.now()}.png`;
        link.target = "_blank"; // 安全策として別タブで開く
        link.click();

    } catch (error) {
        console.error("Kroki連携エラー:", error);
        alert("画像生成に失敗しました。ブラウザがCompressionStreamに対応していない可能性があります。");
    }
};