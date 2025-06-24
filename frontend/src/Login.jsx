import { useNavigate } from "react-router-dom";
import InputBox from "./components/InputBox";

const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
      <header>
        <div className="text-center text-8xl m-15 font-bold text-indigo-50 text-shadow-lg">
          Alpha-Edge
        </div>
      </header>
      <form className="flex flex-col bg-indigo-50 p-8 rounded-md shadow-xl/40 shadow-slate-900 w-150 m-auto">
        <h3 className="font-bold text-3xl p-3 text-center"> Welcome Back</h3>
        <InputBox
          placeholder={"Username*"}
          label={"Username"}
          name={"username"}
        />
        <InputBox
          placeholder={"Password*"}
          label={"Password"}
          name={"password"}
        />
        <button
          id="login"
          className="m-2 bg-fuchsia-950 text-white shadow-xl/10 shadow-slate-900"
        >
          Login
        </button>
        <button
          id="signup"
          className="m-2 bg-green-400 shadow-xl/10 shadow-slate-900 text-black"
          onClick={() => navigate("/signup")}
        >
          Sign-Up
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

export default Login;
