const utils = {
  hoge() {
    console.log("utils hoge");
  },
  logout() {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  },
  checkMe: async () => {
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
  }
};

export default utils;
