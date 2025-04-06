"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useNote from "@/hooks/useNote";
import { updateNoteAction } from "@/actions/notes";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";

type Props = {
  noteId: string;
  startingNoteText: string;
};

let updateTimeout: NodeJS.Timeout;

function NoteTextInput({ noteId, startingNoteText }: Props) {
  const noteIdParam = useSearchParams().get("noteId") || "";
  const { noteText, setNoteText } = useNote();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const headingRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (noteIdParam === noteId) {
      setNoteText(startingNoteText);
      if (headingRef.current) {
        headingRef.current.textContent = startingNoteText.split("\n")[0] || "Enter note heading...";
      }
      if (editorRef.current) {
        editorRef.current.innerHTML = startingNoteText.split("\n").slice(1).join("\n") || "";
      }
    }
  }, [startingNoteText, noteIdParam, noteId, setNoteText]);

  const handleUpdateNote = () => {
    if (!headingRef.current || !editorRef.current) return;
    
    const heading = headingRef.current.textContent || "";
    const content = editorRef.current.innerHTML || "";
    const fullText = `${heading}\n${content}`;
    
    setNoteText(fullText);
    
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      updateNoteAction(noteId, fullText);
    }, 1500);
  };

  const handleHeadingKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editorRef.current?.focus();
    }
  };

  const executeCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    handleUpdateNote();
  };

  // Use a neutral style during server-side rendering to avoid hydration mismatch
  const headingClassName = mounted 
    ? `text-lg font-semibold p-3 border-b ${resolvedTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`
    : "text-lg font-semibold p-3 border-b bg-gray-100 text-black";
  
  const editorClassName = mounted
    ? `custom-scrollbar flex flex-col h-full w-full overflow-y-auto border rounded-b-md p-4 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors ${resolvedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`
    : "custom-scrollbar flex flex-col h-full w-full overflow-y-auto border rounded-b-md p-4 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors bg-white text-black";

  return (
    <div className="flex flex-col h-[900px] w-[1000px]">
      <div className="bg-muted p-2 flex gap-1 flex-wrap rounded-t-md">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => executeCommand('bold')}>
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => executeCommand('italic')}>
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => executeCommand('underline')}>
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div
        ref={headingRef}
        contentEditable
        onInput={handleUpdateNote}
        onKeyDown={handleHeadingKeyDown}
        className={headingClassName}
        suppressContentEditableWarning
        spellCheck={false}
      >
        Enter note heading...
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        onInput={handleUpdateNote}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
        className={editorClassName}
        style={{
          minHeight: "400px",
          lineHeight: "1.6",
          fontFamily: "'Segoe UI', system-ui, sans-serif"
        }}
        suppressContentEditableWarning
      />
    </div>
  );
}

export default NoteTextInput;