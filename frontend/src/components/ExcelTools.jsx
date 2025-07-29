import { useState } from "react";
import { BASE_URL } from "../lib/utils";
import { Input } from "./ui/input"; // from shadCN library
import { Label } from "./ui/label"; // from shadCN library

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "./ui/popover"; // shadCn

const ExcelTools = ({ companyId }) => {
  const [formData, setFormData] = useState({
    years: 5,
    description: "",
    isPublic: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (event) => {
    const key = event.target.id;
    const value = event.target.value;
    if (parseInt(value) > 8) {
      alert("please choose a reasonable amount of years (ie - < 8)");
      return;
    }
    setFormData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const beginExcelGeneration = async (event) => {
    if (parseInt(formData.years) == 0 || formData.years == "") {
      alert("you must generate at least one year");
      event.preventDefault();
      return;
    }
    setIsGenerating(true);
    await fetch(`${BASE_URL}/excel/generate-model-tcm/${companyId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ years: formData.years }),
    });
    setIsGenerating(false);
  };

  return (
    <>
      {!isGenerating && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="self-end border-black border-2 bg-cyan-300 ml-auto mr-5 pt-5 hover:brightness-75 mt-10 text-black">
              Generate TCM Model Outline
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 bg-cyan-200 mb-3 max-h-60 overflow-auto"
            side="top"
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <h4 className="leading-none font-bold">Options:</h4>
                <p className="text-muted-foreground text-sm">
                  choose specifications:
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="years" className="font-bold">
                    Years:
                  </Label>
                  <Input
                    id="years"
                    defaultValue="5"
                    className="col-span-2 h-8"
                    onChange={handleChange}
                    value={formData.years}
                  />
                </div>
              </div>
              <PopoverClose asChild>
                <button
                  onClick={(e) => {
                    beginExcelGeneration(e);
                  }}
                  className="bg-cyan-600 text-white hover:scale-110 hover:brightness-120"
                >
                  Begin Generation
                </button>
              </PopoverClose>
            </div>
          </PopoverContent>
        </Popover>
      )}
      {isGenerating && (
        <div className="mr-auto ml-auto rounded-full w-8 h-8 border-3 border-t-transparent border-cyan-200 animate-spin"></div>
      )}
    </>
  );
};

export default ExcelTools;
