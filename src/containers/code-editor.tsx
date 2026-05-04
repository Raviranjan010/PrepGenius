import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  language: string;
  initialCode?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export const CodeEditor = ({
  language,
  initialCode = "",
  value,
  onChange,
  readOnly = false,
}: CodeEditorProps) => {
  const handleChange = (value: string | undefined) => {
    if (onChange && value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="monaco-wrapper w-full h-full">
      <Editor
        height="100%"
        language={language}
        value={value ?? initialCode}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          readOnly,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          lineNumbers: "on",
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          tabSize: 2,
          wordWrap: "on",
          suggest: { showKeywords: true },
        }}
      />
    </div>
  );
};
