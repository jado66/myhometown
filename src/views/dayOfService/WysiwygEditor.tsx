"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import {
  Button,
  Tooltip,
  Box,
  IconButton,
  Divider,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Title,
  Undo,
  Redo,
  TextFormat,
  ArrowDropDown,
} from "@mui/icons-material";

const colors = [
  { name: "Purple", value: "#a16faf" },
  { name: "Blue", value: "#1b75bc" },
  { name: "Yellow", value: "#febc18" },
  { name: "Green", value: "#318d43" },
  { name: "Orange", value: "#e45620" },
  { name: "Default", value: "inherit" },
];

export interface WysiwygEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export default function WysiwygEditor({
  content = "",
  onChange = (html: string) => {},
  placeholder = "Start writing...",
}: WysiwygEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const [headingMenuAnchor, setHeadingMenuAnchor] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorContent(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "wysiwyg-editor-content",
        placeholder,
      },
    },
  });

  const setColor = (color) => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
  };

  const openHeadingMenu = (event) => {
    setHeadingMenuAnchor(event.currentTarget);
  };

  const closeHeadingMenu = () => {
    setHeadingMenuAnchor(null);
  };

  const handleHeadingSelect = (level) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
    closeHeadingMenu();
  };

  if (!editor) {
    return null;
  }

  return (
    <Box
      className="wysiwyg-editor"
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Box
        className="toolbar"
        sx={{
          bgcolor: "grey.100",
          p: 1,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          alignItems: "center",
        }}
      >
        <Tooltip title="Bold">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive("bold") ? "primary" : "default"}
          >
            <FormatBold fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Italic">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive("italic") ? "primary" : "default"}
          >
            <FormatItalic fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Text type dropdown */}
        <Box>
          <Button
            variant="outlined"
            size="small"
            onClick={openHeadingMenu}
            endIcon={<ArrowDropDown />}
            sx={{ textTransform: "none" }}
          >
            {editor.isActive("heading", { level: 1 }) && "Heading 1"}
            {editor.isActive("heading", { level: 2 }) && "Heading 2"}
            {editor.isActive("heading", { level: 3 }) && "Heading 3"}
            {editor.isActive("paragraph") && "Paragraph"}
            {!editor.isActive("heading") &&
              !editor.isActive("paragraph") &&
              "Text Style"}
          </Button>
          <Menu
            anchorEl={headingMenuAnchor}
            open={Boolean(headingMenuAnchor)}
            onClose={closeHeadingMenu}
          >
            <MenuItem
              onClick={() => handleHeadingSelect(1)}
              selected={editor.isActive("heading", { level: 1 })}
            >
              <Typography variant="h6" sx={{ fontSize: "1.2rem" }}>
                Heading 1
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => handleHeadingSelect(2)}
              selected={editor.isActive("heading", { level: 2 })}
            >
              <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
                Heading 2
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => handleHeadingSelect(3)}
              selected={editor.isActive("heading", { level: 3 })}
            >
              <Typography variant="subtitle1">Heading 3</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => handleHeadingSelect(0)}
              selected={editor.isActive("paragraph")}
            >
              <Typography>Paragraph</Typography>
            </MenuItem>
          </Menu>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive("bulletList") ? "primary" : "default"}
          >
            <FormatListBulleted fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Ordered List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive("orderedList") ? "primary" : "default"}
          >
            <FormatListNumbered fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Align Left">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            color={
              editor.isActive({ textAlign: "left" }) ? "primary" : "default"
            }
          >
            <FormatAlignLeft fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Align Center">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            color={
              editor.isActive({ textAlign: "center" }) ? "primary" : "default"
            }
          >
            <FormatAlignCenter fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Align Right">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            color={
              editor.isActive({ textAlign: "right" }) ? "primary" : "default"
            }
          >
            <FormatAlignRight fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Undo">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Redo">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Text Color">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextFormat fontSize="small" sx={{ mr: 0.5 }} />
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {colors.map((color) => (
                  <Tooltip key={color.value} title={color.name}>
                    <Box
                      component="button"
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "1px solid",
                        borderColor: "grey.300",
                        backgroundColor:
                          color.value !== "inherit" ? color.value : "white",
                        outline: editor.isActive("textStyle", {
                          color: color.value,
                        })
                          ? "2px solid black"
                          : "none",
                        outlineOffset: "2px",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      onClick={() => setColor(color.value)}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
