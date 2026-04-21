import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import "./TiptapEditor.css";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image,
      Gapcursor,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setFontFamily = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fontFamily = e.target.value;
    if (!editor) return;

    if (fontFamily) {
      editor.chain().focus().setFontFamily(fontFamily).run();
    } else {
      editor.chain().focus().unsetFontFamily().run();
    }
  };

  const setFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fontSize = e.target.value;
    if (!editor || !fontSize) return;
    editor.chain().focus().setMark("textStyle", { fontSize }).run();
  };

  const setFormat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const format = e.target.value;
    if (!format || !editor) return;

    switch (format) {
      case "paragraph":
        editor.chain().focus().setParagraph().run();
        break;
      case "heading1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "heading2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "heading3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "heading4":
        editor.chain().focus().toggleHeading({ level: 4 }).run();
        break;
      case "heading5":
        editor.chain().focus().toggleHeading({ level: 5 }).run();
        break;
      case "heading6":
        editor.chain().focus().toggleHeading({ level: 6 }).run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "codeBlock":
        editor.chain().focus().toggleCodeBlock().run();
        break;
    }
  };

  const setTextColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return;
    editor.chain().focus().setColor(e.target.value).run();
  };

  const setBackgroundColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return;
    editor.chain().focus().setHighlight({ color: e.target.value }).run();
  };

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  const addImageFromURL = () => {
    if (!editor) return;

    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const triggerImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://melhemler.com.tm/saglyk/upload/single",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.statusCode === 200 && data.data?.url) {
        editor.chain().focus().setImage({ src: data.data.url }).run();
        alert("Image uploaded successfully");
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const getStyledHTML = () => {
    if (!editor) return "";

    let html = editor.getHTML();

    html = html.replace(
      /<table([^>]*)>/g,
      '<table$1 style="border-collapse: collapse; width: 100%; border: 1px solid #d1d5db; margin: 16px 0; border-radius: 8px; overflow: hidden;">'
    );

    html = html.replace(
      /<th([^>]*)>/g,
      '<th$1 style="border: 1px solid #d1d5db; padding: 8px 12px; background-color: #f3f4f6; font-weight: bold; text-align: left; vertical-align: top;">'
    );

    html = html.replace(
      /<td([^>]*)>/g,
      '<td$1 style="border: 1px solid #d1d5db; padding: 8px 12px; background-color: white; vertical-align: top;">'
    );

    html = html.replace(/<p([^>]*)>/g, '<p$1 style="margin: 0; padding: 0;">');

    return html;
  };

  const exportStyledHTML = async () => {
    const styledHTML = getStyledHTML();
    try {
      await navigator.clipboard.writeText(styledHTML);
      alert("Styled HTML copied to clipboard!");
    } catch (err) {
      console.error(err);
      console.log("Styled HTML:", styledHTML);
      alert("Could not copy to clipboard. Check console for HTML output.");
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-md bg-slate-200 p-2">
        {/* Font Family Dropdown */}
        <select
          className="rounded border px-2 py-1 text-sm"
          onChange={setFontFamily}
        >
          <option value="">Default Font</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
        </select>

        {/* Font Size Dropdown */}
        <select
          className="rounded border px-2 py-1 text-sm"
          onChange={setFontSize}
        >
          <option value="">Size</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="28px">28px</option>
          <option value="32px">32px</option>
        </select>

        {/* Format Dropdown */}
        <select
          className="rounded border px-2 py-1 text-sm"
          onChange={setFormat}
        >
          <option value="">Format</option>
          <option value="paragraph">Paragraph</option>
          <option value="heading1">Heading 1</option>
          <option value="heading2">Heading 2</option>
          <option value="heading3">Heading 3</option>
          <option value="heading4">Heading 4</option>
          <option value="heading5">Heading 5</option>
          <option value="heading6">Heading 6</option>
          <option value="blockquote">Quote</option>
          <option value="codeBlock">Code Block</option>
        </select>

        {/* Text Formatting */}
        <div className="flex gap-1 border-l border-slate-400 pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive("bold") ? "bg-slate-400" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                d="M4 2h4.5a3.501 3.501 0 0 1 2.852 5.53A3.499 3.499 0 0 1 9.5 14H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m1 7v3h4.5a1.5 1.5 0 0 0 0-3Zm3.5-2a1.5 1.5 0 0 0 0-3H5v3Z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive("italic") ? "bg-slate-400" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5h6M7 19h6m1-14l-4 14"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive("underline") ? "bg-slate-400" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M5 21h14v-2H5zM12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive("strike") ? "bg-slate-400" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                d="M10.023 10h1.274q.01.12.01.25a2.56 2.56 0 0 1-.883 1.949q-.426.375-1.03.588A4.1 4.1 0 0 1 8.028 13a4.62 4.62 0 0 1-3.382-1.426q-.29-.388 0-.724q.29-.334.735-.13q.515.544 1.213.876q.699.33 1.449.33q.956 0 1.485-.433q.53-.435.53-1.14a1.7 1.7 0 0 0-.034-.353M5.586 7a2.5 2.5 0 0 1-.294-.507a2.3 2.3 0 0 1-.177-.934q0-.544.228-1.015t.633-.816t.955-.537A3.7 3.7 0 0 1 8.145 3q.867 0 1.603.33q.735.332 1.25.861q.24.423 0 .692q-.24.27-.662.102a3.4 3.4 0 0 0-.978-.669a2.9 2.9 0 0 0-1.213-.242q-.81 0-1.302.375t-.492 1.036q0 .354.14.596q.138.243.374.426q.236.184.515.324q.179.09.362.169zM2.5 8h11a.5.5 0 1 1 0 1h-11a.5.5 0 0 1 0-1"
              />
            </svg>
          </button>
        </div>

        {/* Script and Special */}
        <div className="flex gap-1 border-l border-slate-400 pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`rounded p-1 text-sm hover:bg-slate-300 ${
              editor.isActive("subscript") ? "bg-slate-400" : ""
            }`}
          >
            X₂
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`rounded p-1 text-sm hover:bg-slate-300 ${
              editor.isActive("superscript") ? "bg-slate-400" : ""
            }`}
          >
            X²
          </button>

          <input
            type="color"
            onChange={setTextColor}
            className="h-8 w-8 cursor-pointer rounded border"
            title="Text Color"
          />

          <input
            type="color"
            onChange={setBackgroundColor}
            className="h-8 w-8 cursor-pointer rounded border"
            title="Background Color"
          />

          <button
            type="button"
            onClick={() => {
              editor.chain().focus().clearNodes().run();
              editor.chain().focus().unsetAllMarks().run();
            }}
            className="rounded p-1 hover:bg-slate-300"
            title="Clear Formatting"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M6 5v.18L8.82 8h2.4l-.72-1.68c-.27-.63-.72-1.32-1.41-1.32zm7.39 5l-.39-.91c-.12-.28-.24-.56-.39-.83L10.91 6H20V4H9.91L7.15 1.24c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41L7.09 4H4v2h1.09l1.61 3.74c-.96.19-1.7 1.04-1.7 2.05C5 12.79 5.21 13 6.21 13H18v-2H8.39L9.57 8h2.4l2.6 6H16v2h4v-2h-1.61zM6.21 11H6v-.79c0-.45.36-.81.81-.81s.81.36.81.81v.79z"
              />
            </svg>
          </button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-l border-slate-400 pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive({ textAlign: "left" }) ? "bg-slate-400" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M3 21h8v-2H3v2zm0-4h18v-2H3v2zm0-4h8v-2H3v2zm0-4h18V7H3v2zm0-6v2h8V3H3z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive({ textAlign: "center" }) ? "bg-slate-400" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive({ textAlign: "right" }) ? "bg-slate-400" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive({ textAlign: "justify" }) ? "bg-slate-400" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"
              />
            </svg>
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-l border-slate-400 pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive("bulletList") ? "bg-slate-400" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5S5.5 6.83 5.5 6S4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5s1.5-.68 1.5-1.5s-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive("orderedList") ? "bg-slate-400" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"
              />
            </svg>
          </button>
        </div>

        {/* Table Controls */}
        <div className="flex gap-1 border-l border-slate-400 pl-2">
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className="rounded p-1 hover:bg-slate-300"
            title="Insert Table"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-3h3v3zm0-5H5v-4h3v4zm0-6H5V5h3v3zm6 11h-4v-3h4v3zm0-5h-4v-4h4v4zm0-6h-4V5h4v3zm5 11h-3v-3h3v3zm0-5h-3v-4h3v4zm0-6h-3V5h3v3z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}
            className="rounded p-1 px-2 text-xs hover:bg-slate-300 disabled:opacity-50"
            title="Add Column Before"
          >
            Col+
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            className="rounded p-1 px-2 text-xs hover:bg-slate-300 disabled:opacity-50"
            title="Add Column After"
          >
            +Col
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            className="rounded p-1 px-2 text-xs hover:bg-slate-300 disabled:opacity-50"
            title="Delete Column"
          >
            -Col
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}
            className="rounded p-1 px-2 text-xs hover:bg-slate-300 disabled:opacity-50"
            title="Add Row Before"
          >
            Row+
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            className="rounded p-1 px-2 text-xs hover:bg-slate-300 disabled:opacity-50"
            title="Add Row After"
          >
            +Row
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            className="rounded p-1 px-2 text-xs hover:bg-slate-300 disabled:opacity-50"
            title="Delete Row"
          >
            -Row
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            className="rounded p-1 px-2 text-xs hover:bg-red-300 disabled:opacity-50"
            title="Delete Table"
          >
            Del
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().mergeCells().run()}
            disabled={!editor.can().mergeCells()}
            className="rounded p-1 px-2 text-xs hover:bg-slate-300 disabled:opacity-50"
            title="Merge Cells"
          >
            Merge
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().splitCell().run()}
            disabled={!editor.can().splitCell()}
            className="rounded p-1 px-2 text-xs hover:bg-slate-300 disabled:opacity-50"
            title="Split Cell"
          >
            Split
          </button>
        </div>

        {/* Indent */}
        <div className="flex gap-1 border-l border-slate-400 pl-2">
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().liftListItem("listItem").run()
            }
            className="rounded p-1 hover:bg-slate-300"
            title="Decrease Indent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().sinkListItem("listItem").run()
            }
            className="rounded p-1 hover:bg-slate-300"
            title="Increase Indent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M3 21h18v-2H3v2zM3 8v8l4-4l-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"
              />
            </svg>
          </button>
        </div>

        {/* Links and Media */}
        <div className="flex gap-1 border-l border-slate-400 pl-2">
          <button
            type="button"
            onClick={setLink}
            className={`rounded p-1 hover:bg-slate-300 ${
              editor.isActive("link") ? "bg-slate-400" : ""
            }`}
            title="Insert Link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={triggerImageUpload}
            className="rounded p-1 hover:bg-slate-300"
            title={uploading ? "Uploading..." : "Upload Image"}
            disabled={uploading}
          >
            {!uploading ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
                />
              </svg>
            ) : (
              <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={addImageFromURL}
            className="rounded p-1 hover:bg-slate-300"
            title="Insert Image from URL"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5l-5-5l1.41-1.41L11 12.67V3h2z"
              />
            </svg>
          </button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1 border-l border-slate-400 pl-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="rounded p-1 hover:bg-slate-300 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12.758 21.795c-5.38 0-9.75-4.37-9.75-9.75c0-.41.34-.75.75-.75s.75.34.75.75c0 4.55 3.7 8.25 8.25 8.25s8.25-3.7 8.25-8.25s-3.7-8.25-8.25-8.25c-2.7 0-5.2 1.3-6.75 3.5c.35 0 .82-.05 1.43-.11l2.04-.21a.75.75 0 0 1 .15 1.49l-2.04.21c-1.53.15-2.44.24-3.18-.37c-.72-.63-.79-1.53-.93-3.15l-.18-2.04c-.04-.41.27-.78.68-.81s.78.27.81.68l.18 2.05q.045.585.09 1.02a9.71 9.71 0 0 1 7.69-3.75c5.38 0 9.75 4.37 9.75 9.75s-4.37 9.75-9.75 9.75z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="rounded p-1 hover:bg-slate-300 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M18.364 18.364A9 9 0 1 1 12 3c4.058 0 6.518 2.705 9 5.5M21 4.5v4h-4"
              />
            </svg>
          </button>
        </div>

        {/* Export Styled HTML Button */}
        <div className="flex gap-1 border-l border-slate-400 pl-2">
          <button
            type="button"
            onClick={exportStyledHTML}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            title="Get HTML with inline styles"
          >
            Export HTML
          </button>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="tiptap mt-2 min-h-[300px] rounded-md border px-3 py-2 outline-none focus-within:ring-2 focus-within:ring-blue-500"
      />
    </div>
  );
};

export default TiptapEditor;
