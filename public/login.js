let loginButtonElement = {};
let formElement = {};
let nameInputElement = {};
let passwordInputElement = {};
let changeSignInButtonElement = {};
let changeLoginButtonElement = {};
let submitButtonElement = {};


let mode = "";

document.addEventListener('DOMContentLoaded', () => {

  formElement = document.getElementById('form');

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    if (mode === "signIn") {
      signIn();
    }
    else {
      logIn();
    }
  });

  nameInputElement = document.getElementById('name-input');
  passwordInputElement = document.getElementById('password-input');
  changeSignInButtonElement = document.getElementById('change-signin-button');
  changeLoginButtonElement = document.getElementById('change-login-button');
  submitButtonElement = document.getElementById('submit-button');


  changeSignInButtonElement.addEventListener('click', () => {
    modeChange("signIn");
  });

  changeLoginButtonElement.addEventListener('click', () => {
    modeChange("logIn");
  });



  modeChange("signIn");
});

let signIn = async () => {
  let name_value = nameInputElement.value;
  let password_value = passwordInputElement.value;
  let parameter = { username: name_value, password: password_value };
  let res = await fetch('/api/singIn', {
    method: "Post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parameter),
  })
};

let logIn = async () => {
  let name_value = nameInputElement.value;
  let password_value = passwordInputElement.value;
  let parameter = { username: name_value, password: password_value };

  try {
    let res = await fetch('/api/logIn', {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameter),
    });
    let result = await res.json();
    setToken(result.token);
    window.location.href = "/index.html";
  }
  catch(e) {
    console.error(e.message);
  }
};


const callSecureApi = async () => {
  const token = localStorage.getItem("token");
  console.log("call")
  const response = await fetch("api/secure-data", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  console.log("secure API response:", data);
};







let setToken = (token) => {
  localStorage.setItem("token", token);
};

let modeChange = (modeFlag) => {
  if (modeFlag === mode) return ;
  mode = modeFlag;
  setMode(mode);
};

let setMode = (mode) => {
  if (mode === "signIn") {
    changeSignInButtonElement.classList.add("active-button");
    changeLoginButtonElement.classList.remove("active-button");
    submitButtonElement.textContent = "登録";
  }
  else {
    console.log("Switching to logIn mode");
    changeSignInButtonElement.classList.remove("active-button");
    changeLoginButtonElement.classList.add("active-button");
    submitButtonElement.textContent = "ログイン";
  }
};