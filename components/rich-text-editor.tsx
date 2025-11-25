"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import {
  Bold,
  Italic,
  UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
        },
        orderedList: {
          keepMarks: true,
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-80 p-4 border rounded-md bg-background",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        ),
      },
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  const handleClear = () => {
    editor.commands.clearContent()
    onChange("")
  }

  return (
    <div className="w-full border rounded-md bg-background overflow-hidden">
      <div className="border-b bg-muted p-3 flex flex-wrap gap-1 items-center">
        {/* Formatting Buttons */}
        <div className="flex gap-1 items-center border-r pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run() || disabled}
            className={editor.isActive("bold") ? "bg-accent" : ""}
            title="Đậm (Bold)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run() || disabled}
            className={editor.isActive("italic") ? "bg-accent" : ""}
            title="Nghiêng (Italic)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run() || disabled}
            className={editor.isActive("underline") ? "bg-accent" : ""}
            title="Gạch chân (Underline)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment Buttons */}
        <div className="flex gap-1 items-center border-r px-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            disabled={!editor.can().chain().focus().setTextAlign("left").run() || disabled}
            className={editor.isActive({ textAlign: "left" }) ? "bg-accent" : ""}
            title="Căn trái"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            disabled={!editor.can().chain().focus().setTextAlign("center").run() || disabled}
            className={editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""}
            title="Căn giữa"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            disabled={!editor.can().chain().focus().setTextAlign("right").run() || disabled}
            className={editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""}
            title="Căn phải"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* List Buttons */}
        <div className="flex gap-1 items-center border-r px-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={!editor.can().chain().focus().toggleBulletList().run() || disabled}
            className={editor.isActive("bulletList") ? "bg-accent" : ""}
            title="Danh sách không thứ tự"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={!editor.can().chain().focus().toggleOrderedList().run() || disabled}
            className={editor.isActive("orderedList") ? "bg-accent" : ""}
            title="Danh sách có thứ tự"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Clear Button */}
        <div className="flex gap-1 items-center ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Xóa nội dung"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} disabled={disabled} />
        {!value && <div className="absolute top-4 left-4 pointer-events-none text-muted-foreground">{placeholder}</div>}
      </div>
    </div>
  )
}
