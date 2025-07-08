import InputBox from "./components/InputBox";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "./lib/utils";
import { MIN_PASSWORD_LENGTH } from "./lib/constants";
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

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
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
    } catch {
      return;
    }
  };

  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <header>
        <div className="text-center m-15 text-2xl font-bold text-indigo-50 text-shadow-xl ">
          <h1 className="drop-shadow-[0px_0px_39px_rgba(247,247,247,.7)]">
            Alpha-Edge
          </h1>
        </div>
      </header>
      <form className="flex flex-col bg-indigo-50 p-8 rounded-md shadow-xl/40 w-150 m-auto">
        <h3 className="font-bold text-3xl p-1 text-center">Sign Up</h3>
        <p className="font-bold text-sm p-0 text-center">
          Please sign up to continue{" "}
        </p>
        <InputBox
          placeholder="John Doe"
          label="Full Name"
          name="name"
          value={formData.name}
          handleFormChange={handleFormChange}
        />

        <InputBox
          placeholder="johndoe@gmail.com"
          label="Email"
          name="email"
          value={formData.email}
          handleFormChange={handleFormChange}
        />
        <InputBox
          placeholder="Password"
          label="Password"
          name="password"
          value={formData.password}
          handleFormChange={handleFormChange}
        />
        <InputBox
          placeholder="Username"
          label="Username"
          name="username"
          value={formData.username}
          handleFormChange={handleFormChange}
        />
        <button
          type="submit"
          id="signup"
          className="m-2 bg-green-400 shadow-xl/10 shadow-slate-900  hover:brightness-110"
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
          className="m-2 bg-fuchsia-950 text-white shadow-xl/10 shadow-slate-900 hover:brightness-110"
        >
          Back to login
        </button>
      </form>
    </div>
  );
};

export default SignUp;
