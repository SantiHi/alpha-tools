// starter code from https://www.npmjs.com/package/react-quilljs
import { BASE_URL } from "../lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { CheckLine } from "lucide-react";

const TextEditor = () => {
  const modules = {
    toolbar: [
      [
        "bold",
        "italic",
        "underline",
        "strike",
        { list: "ordered" },
        { list: "bullet" },
      ],
    ],
  };
  const { id } = useParams();
  const [value, setValue] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const getCurrentDoc = async () => {
      const response = await fetch(`${BASE_URL}/portfolios/getNotes/${id}`, {
        method: "GET",
        credentials: "include",
      });
      setValue(await response.json());
    };
    getCurrentDoc();
  }, []);

  const setChanges = (content, delta, source, editor) => {
    if (isSaved) {
      setIsSaved(false);
    }
    //https://stackoverflow.com/questions/67627760/how-should-i-store-html-content-to-db-using-react-quill
    setValue(editor.getHTML());
  };

  const SaveChanges = async () => {
    setIsSaved(true);
    const sendToDatabase = { html: value };
    await fetch(`${BASE_URL}/portfolios/setNotes/${id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendToDatabase),
    });
  };

  return (
    <>
      <h2 className="text-white font-bold m-8 text-3xl">Notes:</h2>
      <div className="bg-white rounded-sm w-[1200px] h-[500px] overflow-auto">
        <div className="relative h-full">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={setChanges}
            modules={modules}
            className="h-full w-full"
          />
          <button
            className="absolute right-2 top-2 z-10 bg-blue-500 h-8 flex items-center justify-center hover:brightness-80 hover:scale-115"
            onClick={SaveChanges}
          >
            Save
          </button>
          {isSaved && (
            <CheckLine className="absolute right-3 top-2 z-10  h-8 flex items-center justify-center hover:brightness-80 hover:scale-115 mr-20" />
          )}
        </div>
      </div>
    </>
  );
};

export default TextEditor;
