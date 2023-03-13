import { useEffect, useMemo, useState } from "react";
import YAML from "yaml";
import { debounce } from "lodash";
import generateSteppedManifest from "../../utils/generators/step";
import eventBus from "../../events/eventBus";
import CodeEditor from "../CodeEditor";
import useWindowDimensions from "../../hooks/useWindowDimensions";

const CodeBox = () => {
  const [language, setLanguage] = useState("yaml");
  const [copyText, setCopyText] = useState("Copy");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [formattedCode, setFormattedCode] = useState<string>("");
  const { height } = useWindowDimensions();

  const debouncedOnGraphUpdate = useMemo(
    () =>
      debounce((payload) => {
        setGeneratedCode(payload);
      }, 600),
    []
  );

  const copy = () => {
    navigator.clipboard.writeText(formattedCode);
    setCopyText("Copied");

    setTimeout(() => {
      setCopyText("Copy");
    }, 300);
  };

  useEffect(() => {
    if (language === "json") {
      setFormattedCode(JSON.stringify(generatedCode, null, 2));
    }

    if (language === "yaml") {
      setFormattedCode(
        YAML.stringify(generatedCode, {
          defaultKeyType: null
        })
      );
    }
  }, [language, generatedCode]);

  useEffect(() => {
    eventBus.on("FETCH_CODE", (data) => {
      const graphData = data.detail.message;
      debouncedOnGraphUpdate(generateSteppedManifest(graphData));
    });

    return () => {
      eventBus.remove("FETCH_CODE", () => undefined);
    };
  }, []);

  return (
    <>
      <div
        className={`absolute top-0 left-0 right-0 z-10 flex justify-end p-1 space-x-2 group-hover:visible invisible`}
      >
        <button
          className={`btn-util ${
            language === "json" ? `btn-util-selected` : ``
          }`}
          onClick={() => setLanguage("json")}
        >
          json
        </button>
        <button
          className={`btn-util ${
            language === "yaml" ? `btn-util-selected` : ``
          }`}
          onClick={() => setLanguage("yaml")}
        >
          yaml
        </button>
        <button className="btn-util" type="button" onClick={copy}>
          {copyText}
        </button>
      </div>

      <CodeEditor
        data={formattedCode}
        language={language}
        onChange={() => {
          return;
        }}
        disabled={true}
        lineWrapping={false}
        height={height - 64}
      />
    </>
  );
};

export default CodeBox;
