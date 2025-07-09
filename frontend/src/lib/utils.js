import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserInfo } from "../context/UserContext";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BASE_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://capstone-project-db-service.onrender.com"; // official database url
const LOGIN_SUCCESS = "password accepted";

const handleLogin = async (
  formData,
  responseSetter,
  setIsLoggedIn,
  setFullName
) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (response.ok === true) {
      const data = await response.json();
      responseSetter(LOGIN_SUCCESS);
      setIsLoggedIn(true);
      setFullName(data.name);
      return true;
    } else {
      const s = await response.json();
      responseSetter(s.error);
    }
  } catch {
    return;
  }
};

const toPercentage = (startPrice, endPrice) => {
  return (((startPrice - endPrice) / startPrice) * 100).toFixed(2);
};

export { handleLogin, BASE_URL, toPercentage };
