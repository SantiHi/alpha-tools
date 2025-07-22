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
  const [isSaved, setIsSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const saveChanges = async () => {
    setIsSaving(true);
    const sendToDatabase = { html: value };
    const response = await fetch(`${BASE_URL}/portfolios/setNotes/${id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendToDatabase),
    });
    if (response.ok) {
      setIsSaved(true);
      setIsSaving(false);
    }
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
          {!isSaved && (
            <button
              className="absolute right-2 top-2 z-10 bg-blue-500 h-8 flex items-center justify-center hover:brightness-80 hover:scale-115"
              onClick={saveChanges}
            >
              Save
            </button>
          )}
          {isSaved && (
            <CheckLine className="absolute right-3 top-2 z-10  h-8 flex items-center justify-center hover:brightness-80 hover:scale-115 " />
          )}
          {isSaving && (
            <div className="absolute right-20 top-0 z-10 rounded-full w-8 h-8 m-3 border-3 border-t-transparent border-blue-200 animate-spin"></div>
          )}
        </div>
      </div>
    </>
  );
};

export default TextEditor;
