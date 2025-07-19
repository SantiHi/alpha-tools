import React from "react";
// starter code from https://www.npmjs.com/package/react-quilljs
import { useQuill } from "react-quilljs";

import "quill/dist/quill.snow.css"; // Add css for snow theme

const TextEditor = () => {
  const theme = "snow";

  const modules = {
    toolbar: [["bold", "italic", "underline", "strike"]],
  };

  const placeholder = "Add notes on the doc!";

  const formats = ["bold", "italic", "underline", "strike"];
  const { quillRef } = useQuill({ theme, modules, formats, placeholder });

  return (
    <>
      <h2 className="text-white font-bold mt-5 mb-2">Notes:</h2>
      <div className="bg-white rounded-sm w-[1200px] h-[300px] overflow-auto">
        <div ref={quillRef} className="h-full w-full" />
      </div>
    </>
  );
};

export default TextEditor;
