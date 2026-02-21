import express, { response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

// Node.jsの標準モジュールでディレクトリ取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// JSONを扱えるようにする（必須）
app.use(express.json());
// ✅ publicフォルダを静的配信（JSやCSSを返せるようにする）
app.use(express.static(path.join(__dirname, "public")));
// "/" にアクセスが来たら index.html を返す
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/mypage", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mypage.html"));
});
app.get("/mermaid", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mermaid.html"));
});

app.post("/api/chatGpt", async (req, res) => {
  try {
    const { question } = req.body;
    const { model } = req.body;
    const { id } = req.body;
    const token = req.headers.authorization; // "Bearer xxx"
    const text_with_context = question;
    const response = await fetch('http://http://54.238.90.135/:8080/api/chatgpt', {

    // const response = await fetch('http://localhost:8080/api/chatgpt', {
    // const response = await fetch('http://49.212.137.241:8080/api/chatgpt', {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: text_with_context, model: model }),
    });
    const { data } = await response.json();

    return res.json({ reply: data });

  }
  catch (error) {
    console.error(error);
    throw new Error("サーバー側でエラーが発生しました。");
  }
});

app.post("/api/chatGpt/mermaid", async (req, res) => {
  try {
    const { prompt } = req.body;
    const { model } = req.body;
    const { uml_type } = req.body;
    const token = req.headers.authorization; // "Bearer xxx"
    const response = await fetch('http://54.238.90.135:8080/api/chatgpt/mermaid', {

    // const response = await fetch('http://localhost:8080/api/chatgpt/mermaid', {
    // const response = await fetch('http://49.212.137.241:8080/api/chatgpt/mermaid', {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: prompt, model: model, umlType: uml_type }),
    });

    const { data } = await response.json();
    return res.json({ reply: data });
  }
  catch (error) {
    console.error(error);
    throw new Error("サーバー側でエラーが発生しました。");
  }
});


app.post("/api/singIn", async (req, res) => {
  try {
    const { username, password } = req.body;
      const response = await fetch('http://54.238.90.135:8080/api/account/create', {

    // const response = await fetch('http://49.212.137.241:8080/api/account/create', {
    // const response = await fetch('http://localhost:8080/api/account/create', {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    });
    //const { data } = await response.json();

    //return res.json({ reply: data });
  }
  catch (error) {
    console.error(error);
    throw new Error("サーバー側でエラーが発生しました。");
  }
});

app.post("/api/logIn", async (req, res) => {
  try {
    const { username, password } = req.body;
    // const response = await fetch('http://49.212.137.241:8080/api/account/logIn', {
    // const response = await fetch('http://localhost:8080/api/account/logIn', {
    const response = await fetch('http://54.238.90.135:8080/api/account/logIn', {

      
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    });
    const data = await response.json();

    return res.json(data);
  }
  catch (error) {
    console.error(error);
    throw new Error("サーバー側でエラーが発生しました。");
  }
});

app.get("/api/secure-data", async (req, res) => {
  const token = req.headers.authorization; // "Bearer xxx"

  try {
    // const response = await fetch('http://49.212.137.241:8080/api/account/list', {
    // const response = await fetch('http://localhost:8080/api/account/list', {
    const response = await fetch('http://54.238.90.135:8080/api/account/list', {

      method: "GET",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return res.json(data);
  }
  catch (error) {
    console.error(error);
    throw new Error("サーバー側でエラーが発生しました。");
  }
});

app.get("/api/me", async (req, res) => {
  const token = req.headers.authorization;
  try {
    // const response = await fetch('http://49.212.137.241:8080/api/account/me', {
    // const response = await fetch('http://localhost:8080/api/account/me', {
    const response = await fetch('http://54.238.90.135:8080/api/account/me', {

      method: "GET",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      console.log("認証エラー発生");
      return res.status(response.status).json({
        message: "認証が必要です。ログインし直してください。",
        isLogin: false,
      });
    }

    const data = await response.json();
    data.isLogin = true;
    return res.json(data);
  }
  catch (error) {
    console.error(error);
    throw new Error("サーバー側でエラーが発生しました。");
  }
});

app.get("/api/my/qa", async (req, res) => {
  const token = req.headers.authorization;
  try {
    // const response = await fetch('http://49.212.137.241:8080/api/my/qa', {
    // const response = await fetch('http://localhost:8080/api/my/qa', {
    const response = await fetch('http://54.238.90.135:8080/api/my/qa', {

      method: "GET",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return res.json(data);
  }
  catch (error) {
    console.error(error);
    throw new Error("サーバー側でエラーが発生しました。");
  }
});




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

