const InputBox = ({ label, placeholder, name, value, handleFormChange }) => {
  return (
    <>
      <label className="font-semibold ml-2">{`${label}`}</label>
      <textarea
        className="bg-white text-base m-2 h-8 rounded-sm p-1 resize-none shadow-xl/10 shadow-slate-900"
        name={name}
        placeholder={`${placeholder}`}
        onChange={handleFormChange}
        value={value}
      ></textarea>
    </>
  );
};

export default InputBox;
