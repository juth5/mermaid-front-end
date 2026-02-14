import app from './app.js';

let modelSelectElement = {};
let imageUrl = '';
let loginButtonElement = {};
let logoutButtonElement = {};


document.addEventListener('DOMContentLoaded', async () => {
  
  let textareaElement = document.getElementById("textarea");
  let questionContainerElement = document.getElementById("question-container");
  let formElement = document.getElementById("form");
  let resultElement = document.getElementById("result");
  let fileInputElement = document.getElementById("file-input");
  let selectedFileText = '';
  let overlayElement = document.getElementById("overlay");
  modelSelectElement = document.getElementById("model-select");
  let sideSelectElement = document.getElementById("side-select");
  let questionDetailElement = document.getElementById("question-detail");
  let copyButton = document.getElementById("copy-button");

  loginButtonElement = document.getElementById('login-button');
  loginButtonElement.addEventListener('click', () => {
      window.location.href = '/login';
  });

  logoutButtonElement = document.getElementById('logout-button');
  logoutButtonElement.addEventListener('click', () => {
    app.utils.logout();
  });

  let me = await app.utils.checkMe();

  if (me.isLogin) {
    loginButtonElement.style.display = 'none';
    logoutButtonElement.style.display = 'inline-block';
  } else {
    loginButtonElement.style.display = 'inline-block';
    logoutButtonElement.style.display = 'none';
  }


//考慮事項を入れる
const questions = [
  {
    id: "approach", 
    question: "スタートから一台目までのアプローチに課題を感じている", 
    keyword: ['アプローチ', '一台目', 'スタート', '詰まる', '8歩'], 
    urls: [
      'https://110mh.net/training-document/110mh%E3%80%81100mh%E3%81%AE%E3%82%A2%E3%83%97%E3%83%AD%E3%83%BC%E3%83%81%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6.html',
      'https://110mh.net/hardle-training/%E3%83%8F%E3%83%BC%E3%83%89%E3%83%AB%E8%B5%B0-%E3%82%A2%E3%83%97%E3%83%AD%E3%83%BC%E3%83%81%E3%81%AE%E7%B7%B4%E7%BF%92%E6%96%B9%E6%B3%95.html',
      'https://110mh.net/hardle-training/%E3%83%8F%E3%83%BC%E3%83%89%E3%83%AB%E8%B5%B0%E3%80%80%E9%80%9F%E3%81%8F%E3%81%AA%E3%82%8B%E3%81%9F%E3%82%81%E3%81%AE%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88.html'
    ]
  },
  {
    id: "legless", 
    question: "抜き足について悩んでいる",
    keyword: ['抜き足', 'リラックス', '踏み切り'], 
    urls: [
      'https://110mh.net/athletics/%E9%99%B8%E4%B8%8A%E7%AB%B6%E6%8A%80%EF%BC%88%E8%B5%B0%E3%82%8A%E3%80%81%E3%83%8F%E3%83%BC%E3%83%89%E3%83%AB%E8%B5%B0%EF%BC%89%E3%81%AE%E5%8A%9B%E3%81%AE%E5%85%A5%E3%82%8C%E6%96%B9%E3%81%AB%E3%81%A4.html',
      'https://110mh.net/hardle-training/%E3%83%8F%E3%83%BC%E3%83%89%E3%83%AB%E8%B5%B0-%E4%BD%8E%E3%81%8F%E8%B7%B3%E3%81%BC%E3%81%86%E3%81%A8%E3%81%99%E3%82%8B%E3%81%93%E3%81%A8.html'
    ],
  },
  // {
  //   id: "leadLeg", 
  //   question: "リード足について悩んでいる",
  //   keyword: ['リード足', '踏み切り', '踏切'], 
  // },
  {
    id: "practice", 
    question: "練習方法について悩んでいる",
    keyword: ['練習方法', 'コツ', '3歩', 'インターバル', 'ドリル'], 
    urls: [
      'https://110mh.net/hardle-training/%E3%83%8F%E3%83%BC%E3%83%89%E3%83%AB%E8%B5%B0%E3%81%AE%E6%8C%87%E5%B0%8E%E9%A0%86%E5%BA%8F.html',
      'https://110mh.net/unclassified/%E3%83%8F%E3%83%BC%E3%83%89%E3%83%AA%E3%83%B3%E3%82%B0%E3%80%80%E3%82%B7%E3%83%B3%E3%83%97%E3%83%AB%E3%81%AA%E5%8B%95%E3%81%8D.html',
      'https://110mh.net/hardle-training/%E3%83%8F%E3%83%BC%E3%83%89%E3%83%AB%E8%B5%B0%EF%BC%88110mh-100mh%EF%BC%89%E3%81%AE%E7%B7%B4%E7%BF%92.html',

    ],

  },
  {
    id: "drill", 
    question: "ハードルドリルについて知りたい",
    keyword: ['練習方法', 'コツ', '3歩', 'インターバル', 'ドリル'], 
    urls: [
      'https://110mh.net/athletics/110mh-100mh-%E3%83%8F%E3%83%BC%E3%83%89%E3%83%AB%E8%B5%B0%E3%81%AE%E3%83%8F%E3%83%BC%E3%83%89%E3%83%AB%E3%83%89%E3%83%AA%E3%83%AB%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6.html',
      'https://110mh.net/athletics/simple-training.html'
    ],
  },
];




// ラジオボタン生成
questions.forEach((question) => {
  const div = document.createElement("div");
  const label = document.createElement("label");
  const radio = document.createElement("input");
  const span = document.createElement("span");

  // ラジオボタン設定
  radio.type = "radio";
  radio.name = "question-group"; // 同一nameで1つだけ選択可
  radio.id = question.id;
  radio.value = question.id; // または question.question
  radio.className = "mr10";
  radio.required = true; // ← ここを追加！

  radio.addEventListener("change", () => {
    questionDetailElement.textContent = `🦄『${question.question}』について具体的に教えてください。`;
  });

  // 表示テキスト
  span.textContent = question.question;

  // ラベル設定
  label.className = "f fm";
  label.appendChild(radio);
  label.appendChild(span);

  // コンテナに追加
  div.className = "mb16";
  div.appendChild(label);
  questionContainerElement.appendChild(div);
});

  //フォーム送信時の処理
  formElement.addEventListener('submit', async (event) => {
    event.preventDefault();
    openLoadingModal(overlayElement);
    const selected = document.querySelector('input[name="question-group"]:checked');
    let selected_value = selected.value;

    // idが一致するオブジェクトを検索
    const matched = questions.find(q => q.id === selected_value);
    let question_text = `${matched.question} ${textareaElement.value}`;

    try {
      let response_data = await getChatGptResponse(question_text, matched.id);      
      resultElement.innerHTML = marked.parse(response_data);
      alert('ページ下部の出力結果を確認してください。');
    } catch (e) {
      alert(e.message);
      console.error("Error logging final_text:", e);
    }
    finally {
      closeLoadingModal(overlayElement);
    }
  });

  copyButton.addEventListener('click', async () => {
    const textToCopy = resultElement.innerText;
    try {
      await navigator.clipboard.writeText(textToCopy);
      alert("テキストをコピーしました！");
    }
    catch (err) {
      console.error("Failed to copy text: ", err);
    }
  });
});

let getChatGptResponse = async (question, id) => {
  let model = modelSelectElement.value;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch('api/chatGpt', {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question, model: model , id: id }),
    });

    const data = await res.json();
    const answer = data.reply.answer || "（応答を取得できませんでした）";
    return answer;
  }
  catch (error) {
    console.error(error);
    throw new Error("サーバー側でエラーが発生しました。");
  }
};

let getExtractCsv = (md) => {
  const m = md.match(/```csv\s*([\s\S]*?)```/i);
  return m ? m[1].trim() : null;
};

let openLoadingModal = (overlayElement) => {
    overlayElement.classList.remove("hide");
    overlayElement.classList.add("show");
};

let closeLoadingModal = (overlayElement) => {
    overlayElement.classList.remove("show");
    overlayElement.classList.add("hide");
};

let signIn = async () => {
  let parameter = {};
  let res = await fetch('/api/singIn', {
    method: "Post",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      body: JSON.stringify(parameter),
    },

  })
};

// let callApi = async () => {
//   console.log('callApi called');

//   let param = {
//     id: 1,
//     model: 'gpt-4',
//     question: 'ハードルのスタートダッシュを速くするには？'
//   };
//   let res = await fetch('http://49.212.137.241:8080/api/chatgpt', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(param),
//   });
//   let data = await res.json();
//   console.log(data, "chatGPTより");
// };