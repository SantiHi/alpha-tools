const Footer = () => {
  return (
    <footer className="flex flex-row justify-center text-center text-xl text-indigo-50 self-center w-full h-16 pt-3 font-medium object-center">
      <p className="drop-shadow-[0px_0px_39px_rgba(247,247,247,1)]">
        Santiago Criado |{" "}
      </p>
      <a href="https://github.com/Capston-Meta-Project-Santiago-Criado/Capstone-Project">
        <img
          className="h-5 w-5 m-1.5 transition-transform duration-200 ease-in-out hover:scale-125 hover:cursor-pointer filter invert"
          src={
            "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
          }
          alt="GitHub"
        />
      </a>
    </footer>
  );
};

export default Footer;
