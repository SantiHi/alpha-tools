import InputBox from "./components/InputBox";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "./utils/reused";
import { useState } from "react";

const RESULT_SUCCESS = "Thank you for signing up, redirecting to login...";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    username: "",
    email: "",
  });

  const wait = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const [submitResult, setSubmitResult] = useState(null);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const createUser = async (event) => {
    event.preventDefault();
    if (
      formData.name == "" ||
      formData.password == "" ||
      formData.username == "" ||
      formData.email == ""
    ) {
      alert("Please do not leave any sections empty");
      return;
    }

    if (formData.password.length < 8) {
      alert("Please make sure passwords are longer than 8 characters");
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitResult(RESULT_SUCCESS);
        await wait(500);
        navigate("/");
      } else {
        const s = await response.json();
        setSubmitResult(s.error);
      }
    } catch (err) {}
  };

  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <header>
        <div className="text-center text-8xl m-15 font-bold text-indigo-50 text-shadow-lg">
          Alpha-Edge
        </div>
      </header>
      <form className="flex flex-col bg-indigo-50 p-8 rounded-md shadow-xl/40 shadow-slate-900 w-150 m-auto">
        <h3 className="font-bold text-3xl p-1 text-center">Sign Up</h3>
        <p className="font-bold text-sm p-0 text-center">
          Please sign up to continue{" "}
        </p>
        <InputBox
          placeholder={"ex: Santiago Criado"}
          label={"Name"}
          name={"name"}
          value={formData.name}
          handleFormChange={handleFormChange}
        />
        <InputBox
          placeholder={"ex: 1234"}
          label={"Set Password"}
          name={"password"}
          value={formData.password}
          handleFormChange={handleFormChange}
        />
        <InputBox
          placeholder={"ex: Cool-Dude-1"}
          label={"New Username"}
          name={"username"}
          value={formData.username}
          handleFormChange={handleFormChange}
        />
        <InputBox
          placeholder={"bobby@gmail.com"}
          label={"Email"}
          name={"email"}
          value={formData.email}
          handleFormChange={handleFormChange}
        />
        <button
          type="submit"
          id="signup"
          className="m-2 bg-green-400 shadow-xl/10 shadow-slate-900"
          onClick={createUser}
        >
          Sign-Up
        </button>
        {submitResult != null && (
          <p className="text-center font-bold ">{submitResult}</p>
        )}
        <button
          onClick={() => {
            navigate("/");
          }}
          id="login"
          className="m-2 bg-fuchsia-950 text-white shadow-xl/10 shadow-slate-900"
        >
          back to login
        </button>
      </form>
      <footer className="fixed flex flex-row justify-center bottom-0 text-center text-2xl self-center w-full bg-indigo-50 h-15 pt-3 font-medium object-center">
        Santiago Criado |
        <a href="https://github.com/Capston-Meta-Project-Santiago-Criado/Capstone-Project">
          <img
            className="h-5 w-5 m-1.75 transition-transform duration-200 ease-in-out hover:scale-125 hover:cursor-pointer "
            src={
              "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
            }
            alt="GitHub"
          />
        </a>
      </footer>
    </div>
  );
};

export default SignUp;
