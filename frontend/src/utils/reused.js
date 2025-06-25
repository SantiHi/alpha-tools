const BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : ""; // official database url
const LOGIN_SUCCESS = "password accepted";

const handleLogin = async (formData, responseSetter, attemptLogin) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      responseSetter(LOGIN_SUCCESS);
      await wait(500);
      attemptLogin();
      console.log("did I get here");
    } else {
      console.log("did I get here instead?");
      const s = await response.json();
      responseSetter(s.error);
    }
  } catch (err) {}
};

export { handleLogin, BASE_URL };
