import app from './app.js';

let userNameElement = {};
let logContainerElement = {};
let qaData = [];

document.addEventListener('DOMContentLoaded', async () => {
  userNameElement = document.getElementById("user-name");
  logContainerElement = document.getElementById("log-container");

  let auth_data = await checkMe();
  
  if (!auth_data.isLogin) {
    alert("認証が必要です。ログインし直してください。");
    window.location.href = "/login.html";
    return;
  }
  let qa_data = await getMyQuestionLog();

  userNameElement.textContent = auth_data.username;
  qaData = qa_data;
  app.utils.hoge();
  setLogData(qaData);
});

let setLogData = (data) => {
      data.forEach((item, index) => {
        let qElement = document.createElement('div');
        let answerElement = document.createElement('div');
        qElement.textContent = `${index + 1}. 質問: ${item.question}`;
        answerElement.innerHTML = marked.parse(item.answer);
        qElement.classList.add('bold');
        qElement.classList.add('mb4');
        answerElement.classList.add('mb12');
        answerElement.classList.add('border-bottom');
        answerElement.classList.add('pb10');
        logContainerElement.appendChild(qElement);
        logContainerElement.appendChild(answerElement);
      });
};

let checkMe = async () => {
  const token = localStorage.getItem("token");
  try {
    let res = await fetch('/api/me', {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    let data = await res.json();
    return data;

  }
  catch (error) {
    console.error(error);
  }
  
};

let getMyQuestionLog = async () => {
  const token = localStorage.getItem("token");
  let res = await fetch('/api/my/qa', {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
  });
  let data = await res.json();
  return data;
};


