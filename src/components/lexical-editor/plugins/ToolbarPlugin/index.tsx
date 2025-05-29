/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from "react";

import {
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isListNode, ListNode } from "@lexical/list";
import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $isHeadingNode } from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
} from "@lexical/selection";
import { $isTableNode, $isTableSelection } from "@lexical/table";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  $isEditorIsNestedEditor,
  IS_APPLE,
  mergeRegister,
} from "@lexical/utils";
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  HISTORIC_TAG,
  INDENT_CONTENT_COMMAND,
  LexicalEditor,
  NodeKey,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { Dispatch, useCallback, useEffect, useState, MouseEvent } from "react";
import * as React from "react";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import {
  blockTypeToBlockName,
  useToolbarState,
} from "../../context/ToolbarContext";
import useModal from "../../hooks/useModal";
import catTypingGif from "../../images/cat-typing.gif";
import DropdownColorPicker from "../../ui/DropdownColorPicker";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { sanitizeUrl } from "../../utils/url";
import { EmbedConfigs } from "../AutoEmbedPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import {
  INSERT_IMAGE_COMMAND,
  InsertImageDialog,
  InsertImagePayload,
} from "../ImagesPlugin";
import { InsertInlineImageDialog } from "../InlineImagePlugin";
import InsertLayoutDialog from "../LayoutPlugin/InsertLayoutDialog";
import { INSERT_PAGE_BREAK } from "../PageBreakPlugin";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
import { InsertTableDialog } from "../TablePlugin";
import FontSize from "./fontSize";
import {
  clearFormatting,
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
} from "./utils";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Redo,
  Undo,
  Link,
  FormatColorFill,
  MoreHoriz,
  Numbers,
  CheckBox,
  FormatQuote,
  Circle,
  ViewHeadline,
  HorizontalRule,
  InsertPageBreak,
  Image,
  ArtTrack,
  CalendarViewMonth,
  ViewColumn,
  ChevronRight,
  Add,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatIndentDecrease,
  FormatIndentIncrease,
  ArrowDropDown,
  Clear,
  Subscript,
  FormatStrikethrough,
  Superscript,
  Highlight,
} from "@mui/icons-material";

import { H1Icon } from "../../icons/H1Icon";
import { H2Icon } from "../../icons/H2Icon";
import { H3Icon } from "../../icons/H3Icon";

import {
  IconButton,
  Menu,
  MenuItem,
  Button,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider as MuiDivider,
  Box,
  Stack,
} from "@mui/material";

const rootTypeToRootName = {
  root: "Root",
  table: "Table",
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ["10px", "10px"],
  ["11px", "11px"],
  ["12px", "12px"],
  ["13px", "13px"],
  ["14px", "14px"],
  ["15px", "15px"],
  ["16px", "16px"],
  ["17px", "17px"],
  ["18px", "18px"],
  ["19px", "19px"],
  ["20px", "20px"],
];

function AlignmentIcon({ alignment }: { alignment: ElementFormatType }) {
  switch (alignment) {
    case "left":
      return FormatAlignLeft;
    case "center":
      return FormatAlignCenter;
    case "right":
      return FormatAlignRight;
    case "justify":
      return FormatAlignJustify;
    case "start":
      return FormatAlignLeft;
    case "end":
      return FormatAlignRight;
    default:
      return FormatAlignLeft;
  }
}

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, "">]: {
    icon: any;
    iconRTL: any;
    name: string;
  };
} = {
  center: {
    icon: <FormatAlignCenter />,
    iconRTL: <FormatAlignCenter />,
    name: "Center Align",
  },
  end: {
    icon: <FormatAlignLeft />,
    iconRTL: <FormatAlignLeft />,
    name: "End Align",
  },
  justify: {
    icon: <FormatAlignJustify />,
    iconRTL: <FormatAlignJustify />,
    name: "Justify Align",
  },
  left: {
    icon: <FormatAlignLeft />,
    iconRTL: <FormatAlignLeft />,
    name: "Left Align",
  },
  right: {
    icon: <FormatAlignRight />,
    iconRTL: <FormatAlignRight />,
    name: "Right Align",
  },
  start: {
    icon: <FormatAlignLeft />,
    iconRTL: <FormatAlignRight />,
    name: "Start Align",
  },
};

function Divider(): JSX.Element {
  return <MuiDivider orientation="vertical" flexItem />;
}

function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        disabled={disabled}
        onClick={handleClick}
        endIcon={<ArrowDropDown />}
        sx={{
          textTransform: "none",
          borderRadius: 0,
          my: "auto",
        }}
        aria-controls={open ? "block-format-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-label="Formatting options for text style"
      >
        {blockTypeToBlockName[blockType]}
      </Button>
      <Menu
        id="block-format-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "block-format-button",
        }}
      >
        <MenuItem
          onClick={() => {
            formatParagraph(editor);
            handleClose();
          }}
          selected={blockType === "paragraph"}
          sx={{ minWidth: "200px" }}
        >
          <ListItemIcon>
            <ViewHeadline />
          </ListItemIcon>
          <ListItemText>Normal</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            formatHeading(editor, blockType, "h1");
            handleClose();
          }}
          selected={blockType === "h1"}
        >
          <ListItemIcon>H1</ListItemIcon>
          <ListItemText>Heading 1</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            formatHeading(editor, blockType, "h2");
            handleClose();
          }}
          selected={blockType === "h2"}
        >
          <ListItemIcon>H2</ListItemIcon>
          <ListItemText>Heading 2</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            formatHeading(editor, blockType, "h3");
            handleClose();
          }}
          selected={blockType === "h3"}
        >
          <ListItemIcon>H3</ListItemIcon>
          <ListItemText>Heading 3</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            formatHeading(editor, blockType, "h4");
            handleClose();
          }}
          selected={blockType === "h4"}
        >
          <ListItemIcon>H4</ListItemIcon>
          <ListItemText>Heading 4</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            formatBulletList(editor, blockType);
            handleClose();
          }}
          selected={blockType === "bullet"}
        >
          <ListItemIcon>
            <Circle />
          </ListItemIcon>
          <ListItemText>Bullet List</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            formatNumberedList(editor, blockType);
            handleClose();
          }}
          selected={blockType === "number"}
        >
          <ListItemIcon>
            <Numbers />
          </ListItemIcon>
          <ListItemText>Numbered List</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            formatCheckList(editor, blockType);
            handleClose();
          }}
          selected={blockType === "check"}
        >
          <ListItemIcon>
            <CheckBox />
          </ListItemIcon>
          <ListItemText>Check List</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            formatQuote(editor, blockType);
            handleClose();
          }}
          selected={blockType === "quote"}
        >
          <ListItemIcon>
            <FormatQuote />
          </ListItemIcon>
          <ListItemText>Quote</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

function FontDropDown({
  editor,
  value,
  style,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
      handleClose();
    },
    [editor, style, handleClose]
  );

  const buttonAriaLabel =
    style === "font-family"
      ? "Formatting options for font family"
      : "Formatting options for font size";

  return (
    <>
      <Button
        disabled={disabled}
        onClick={handleClick}
        endIcon={<ArrowDropDown />}
        sx={{
          textTransform: "none",
          borderRadius: 0,
          my: "auto",
        }}
        aria-controls={open ? `${style}-menu` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-label={buttonAriaLabel}
      >
        {value}
      </Button>
      <Menu
        id={`${style}-menu`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": `${style}-button`,
        }}
      >
        {(style === "font-family"
          ? FONT_FAMILY_OPTIONS
          : FONT_SIZE_OPTIONS
        ).map(([option, text]) => (
          <MenuItem
            key={option}
            onClick={() => handleOptionClick(option)}
            selected={value === option}
            sx={style === "font-size" ? { minWidth: "100px" } : undefined}
          >
            <ListItemText>{text}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function ElementFormatDropdown({
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || "left"];

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const CurrentFormatIcon = AlignmentIcon({ alignment: value });

  return (
    <>
      <IconButton
        disabled={disabled}
        onClick={handleClick}
        sx={{
          borderRadius: "0",
          my: "auto",
        }}
        aria-controls={open ? "alignment-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-label="Formatting options for text alignment"
      >
        <CurrentFormatIcon />
      </IconButton>
      <Menu
        id="alignment-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "alignment-button",
        }}
      >
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
            handleClose();
          }}
          selected={value === "left"}
        >
          <ListItemIcon>
            <FormatAlignLeft />
          </ListItemIcon>
          <ListItemText>Left Align</ListItemText>
          <Typography variant="body2" color="text.secondary">
            {SHORTCUTS.LEFT_ALIGN}
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
            handleClose();
          }}
          selected={value === "center"}
        >
          <ListItemIcon>
            <FormatAlignCenter />
          </ListItemIcon>
          <ListItemText>Center Align</ListItemText>
          <Typography variant="body2" color="text.secondary">
            {SHORTCUTS.CENTER_ALIGN}
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
            handleClose();
          }}
          selected={value === "right"}
        >
          <ListItemIcon>
            <FormatAlignRight />
          </ListItemIcon>
          <ListItemText>Right Align</ListItemText>
          <Typography variant="body2" color="text.secondary">
            {SHORTCUTS.RIGHT_ALIGN}
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
            handleClose();
          }}
          selected={value === "justify"}
        >
          <ListItemIcon>
            <FormatAlignJustify />
          </ListItemIcon>
          <ListItemText>Justify Align</ListItemText>
          <Typography variant="body2" color="text.secondary">
            {SHORTCUTS.JUSTIFY_ALIGN}
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "start");
            handleClose();
          }}
          selected={value === "start"}
        >
          <ListItemIcon>
            {isRTL ? <FormatAlignRight /> : <FormatAlignLeft />}
          </ListItemIcon>
          <ListItemText>Start Align</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "end");
            handleClose();
          }}
          selected={value === "end"}
        >
          <ListItemIcon>
            {isRTL ? <FormatAlignLeft /> : <FormatAlignRight />}
          </ListItemIcon>
          <ListItemText>End Align</ListItemText>
        </MenuItem>
        <MuiDivider />
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
            handleClose();
          }}
        >
          <ListItemIcon>
            <FormatIndentDecrease />
          </ListItemIcon>
          <ListItemText>Outdent</ListItemText>
          <Typography variant="body2" color="text.secondary">
            {SHORTCUTS.OUTDENT}
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
            handleClose();
          }}
        >
          <ListItemIcon>
            {isRTL ? <FormatIndentDecrease /> : <FormatIndentIncrease />}
          </ListItemIcon>
          <ListItemText>Indent</ListItemText>
          <Typography variant="body2" color="text.secondary">
            {SHORTCUTS.INDENT}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

// Converts the MoreHoriz dropdown to MUI Menu
function MoreTextFormatMenu({
  editor,
  toolbarState,
  disabled = false,
}: {
  editor: LexicalEditor;
  toolbarState: any;
  disabled?: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        disabled={disabled}
        onClick={handleClick}
        sx={{
          borderRadius: "0",
          my: "auto",
        }}
        aria-controls={open ? "more-text-format-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-label="Formatting options for additional text styles"
      >
        <MoreHoriz />
      </IconButton>
      <Menu
        id="more-text-format-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "more-text-format-button",
        }}
      >
        {/* <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "lowercase");
            handleClose();
          }}
          selected={toolbarState.isLowercase}
        >
          <ListItemIcon></ListItemIcon>
          <ListItemText>Lowercase</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "uppercase");
            handleClose();
          }}
          selected={toolbarState.isUppercase}
        >
          <ListItemIcon></ListItemIcon>
          <ListItemText>Uppercase</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "capitalize");
            handleClose();
          }}
          selected={toolbarState.isCapitalize}
        >
          <ListItemIcon></ListItemIcon>
          <ListItemText>Capitalize</ListItemText>
        </MenuItem> */}
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
            handleClose();
          }}
          selected={toolbarState.isStrikethrough}
        >
          <ListItemIcon>
            <FormatStrikethrough />
          </ListItemIcon>
          <ListItemText>Strikethrough</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
            handleClose();
          }}
          selected={toolbarState.isSubscript}
        >
          <ListItemIcon>
            <Subscript />
          </ListItemIcon>
          <ListItemText>Subscript</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
            handleClose();
          }}
          selected={toolbarState.isSuperscript}
        >
          <ListItemIcon>
            <Superscript />
          </ListItemIcon>
          <ListItemText>Superscript</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            clearFormatting(editor);
            handleClose();
          }}
        >
          <ListItemIcon>
            <Clear />
          </ListItemIcon>
          <ListItemText>Clear Formatting</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

// Converts the Insert dropdown to MUI Menu
function InsertMenu({
  editor,
  activeEditor,
  showModal,
  disabled = false,
}: {
  editor: LexicalEditor;
  activeEditor: LexicalEditor;
  showModal: any;
  disabled?: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        disabled={disabled}
        onClick={handleClick}
        endIcon={<ArrowDropDown />}
        startIcon={<Add />}
        sx={{
          textTransform: "none",
          borderRadius: 0,
          my: "auto",
        }}
        aria-controls={open ? "insert-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-label="Insert specialized editor node"
      >
        Insert
      </Button>
      <Menu
        id="insert-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "insert-button",
        }}
      >
        <MenuItem
          onClick={() => {
            activeEditor.dispatchCommand(
              INSERT_HORIZONTAL_RULE_COMMAND,
              undefined
            );
            handleClose();
          }}
        >
          <ListItemIcon>
            <HorizontalRule />
          </ListItemIcon>
          <ListItemText>Horizontal Rule</ListItemText>
        </MenuItem>
        {/* <MenuItem
          onClick={() => {
            activeEditor.dispatchCommand(INSERT_PAGE_BREAK, undefined);
            handleClose();
          }}
        >
          <ListItemIcon>
            <InsertPageBreak />
          </ListItemIcon>
          <ListItemText>Page Break</ListItemText>
        </MenuItem> */}
        <MenuItem
          onClick={() => {
            showModal("Insert Image", (onClose: () => void) => (
              <InsertImageDialog
                activeEditor={activeEditor}
                onClose={onClose}
              />
            ));
            handleClose();
          }}
        >
          <ListItemIcon>
            <Image />
          </ListItemIcon>
          <ListItemText>Image</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            showModal("Insert Inline Image", (onClose: () => void) => (
              <InsertInlineImageDialog
                activeEditor={activeEditor}
                onClose={onClose}
              />
            ));
            handleClose();
          }}
        >
          <ListItemIcon>
            <ArtTrack />
          </ListItemIcon>
          <ListItemText>Inline Image</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            showModal("Insert Table", (onClose: () => void) => (
              <InsertTableDialog
                activeEditor={activeEditor}
                onClose={onClose}
              />
            ));
            handleClose();
          }}
        >
          <ListItemIcon>
            <CalendarViewMonth />
          </ListItemIcon>
          <ListItemText>Table</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            showModal("Insert Columns Layout", (onClose: () => void) => (
              <InsertLayoutDialog
                activeEditor={activeEditor}
                onClose={onClose}
              />
            ));
            handleClose();
          }}
        >
          <ListItemIcon>
            <ViewColumn />
          </ListItemIcon>
          <ListItemText>Columns Layout</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
            handleClose();
          }}
        >
          <ListItemIcon>
            <ChevronRight />
          </ListItemIcon>
          <ListItemText>Collapsible container</ListItemText>
        </MenuItem>
        {EmbedConfigs.map((embedConfig) => (
          <MenuItem
            key={embedConfig.type}
            onClick={() => {
              activeEditor.dispatchCommand(
                INSERT_EMBED_COMMAND,
                embedConfig.type
              );
              handleClose();
            }}
          >
            <ListItemIcon>{embedConfig.icon}</ListItemIcon>
            <ListItemText>{embedConfig.contentName}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

// Convert code language dropdown to MUI Menu
function CodeLanguageDropdown({
  disabled = false,
  codeLanguage,
  onCodeLanguageSelect,
}: {
  disabled?: boolean;
  codeLanguage: string;
  onCodeLanguageSelect: (value: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        disabled={disabled}
        onClick={handleClick}
        endIcon={<ArrowDropDown />}
        sx={{
          textTransform: "none",
          borderRadius: 0,
          my: "auto",
        }}
        aria-controls={open ? "code-language-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-label="Select language"
      >
        {getLanguageFriendlyName(codeLanguage)}
      </Button>
      <Menu
        id="code-language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "code-language-button",
        }}
      >
        {CODE_LANGUAGE_OPTIONS.map(([value, name]) => (
          <MenuItem
            key={value}
            onClick={() => {
              onCodeLanguageSelect(value);
              handleClose();
            }}
            selected={value === codeLanguage}
          >
            <ListItemText>{name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default function ToolbarPlugin({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  activeEditor: LexicalEditor;
  setActiveEditor: Dispatch<LexicalEditor>;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );
  const [modal, showModal] = useModal();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const { toolbarState, updateToolbarState } = useToolbarState();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
        const rootElement = activeEditor.getRootElement();
        updateToolbarState(
          "isImageCaption",
          !!rootElement?.parentElement?.classList.contains(
            "image-caption-container"
          )
        );
      } else {
        updateToolbarState("isImageCaption", false);
      }

      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      updateToolbarState("isRTL", $isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const isLink = $isLinkNode(parent) || $isLinkNode(node);
      updateToolbarState("isLink", isLink);

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        updateToolbarState("rootType", "table");
      } else {
        updateToolbarState("rootType", "root");
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();

          updateToolbarState("blockType", type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            updateToolbarState(
              "blockType",
              type as keyof typeof blockTypeToBlockName
            );
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            updateToolbarState(
              "codeLanguage",
              language ? CODE_LANGUAGE_MAP[language] || language : ""
            );
            return;
          }
        }
      }
      // Handle buttons
      updateToolbarState(
        "fontColor",
        $getSelectionStyleValueForProperty(selection, "color", "#000")
      );
      updateToolbarState(
        "bgColor",
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          "#fff"
        )
      );
      updateToolbarState(
        "fontFamily",
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }

      // If matchingParent is a valid node, pass it's format type
      updateToolbarState(
        "elementFormat",
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || "left"
      );
    }
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      // Update text format
      updateToolbarState("isBold", selection.hasFormat("bold"));
      updateToolbarState("isItalic", selection.hasFormat("italic"));
      updateToolbarState("isUnderline", selection.hasFormat("underline"));
      updateToolbarState(
        "isStrikethrough",
        selection.hasFormat("strikethrough")
      );
      updateToolbarState("isSubscript", selection.hasFormat("subscript"));
      updateToolbarState("isSuperscript", selection.hasFormat("superscript"));
      updateToolbarState("isHighlight", selection.hasFormat("highlight"));
      updateToolbarState("isCode", selection.hasFormat("code"));
      updateToolbarState(
        "fontSize",
        $getSelectionStyleValueForProperty(selection, "font-size", "15px")
      );
      updateToolbarState("isLowercase", selection.hasFormat("lowercase"));
      updateToolbarState("isUppercase", selection.hasFormat("uppercase"));
      updateToolbarState("isCapitalize", selection.hasFormat("capitalize"));
    }
  }, [activeEditor, editor, updateToolbarState]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar, setActiveEditor]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          updateToolbarState("canUndo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          updateToolbarState("canRedo", payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor, updateToolbarState]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: HISTORIC_TAG } : {}
      );
    },
    [activeEditor]
  );

  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ "background-color": value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://")
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, setIsLinkEditMode, toolbarState.isLink]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );
  const insertGifOnClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  const canViewerSeeInsertDropdown = !toolbarState.isImageCaption;
  const canViewerSeeInsertCodeButton = !toolbarState.isImageCaption;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid theme.divider",
      }}
    >
      <IconButton
        sx={{
          borderRadius: "0",
          my: "auto",
        }}
        disabled={!toolbarState.canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
        aria-label="Undo"
      >
        <Undo />
      </IconButton>
      <IconButton
        sx={{
          borderRadius: "0",
          my: "auto",
        }}
        disabled={!toolbarState.canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        title={IS_APPLE ? "Redo (⇧⌘Z)" : "Redo (Ctrl+Y)"}
        type="button"
        aria-label="Redo"
      >
        <Redo />
      </IconButton>
      <Divider />
      {toolbarState.blockType in blockTypeToBlockName &&
        activeEditor === editor && (
          <>
            <BlockFormatDropDown
              disabled={!isEditable}
              blockType={toolbarState.blockType}
              rootType={toolbarState.rootType}
              editor={activeEditor}
            />
            <Divider />
          </>
        )}
      {toolbarState.blockType === "code" ? (
        <CodeLanguageDropdown
          disabled={!isEditable}
          codeLanguage={toolbarState.codeLanguage}
          onCodeLanguageSelect={onCodeLanguageSelect}
        />
      ) : (
        <>
          {/* <FontDropDown
            disabled={!isEditable}
            style={"font-family"}
            value={toolbarState.fontFamily}
            editor={activeEditor}
          /> */}
          {/* <Divider /> */}
          <FontSize
            selectionFontSize={toolbarState.fontSize.slice(0, -2)}
            editor={activeEditor}
            disabled={!isEditable}
          />
          <Divider />
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            sx={{
              borderRadius: "0",
              my: "auto",
              backgroundColor: toolbarState.isBold ? "#e0e0e0" : "transparent",
            }}
            title={`Bold (${SHORTCUTS.BOLD})`}
            type="button"
            aria-label={`Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`}
          >
            <FormatBold />
          </IconButton>
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            sx={{
              borderRadius: "0",
              my: "auto",
              backgroundColor: toolbarState.isItalic
                ? "#e0e0e0"
                : "transparent",
            }}
            title={`Italic (${SHORTCUTS.ITALIC})`}
            type="button"
            aria-label={`Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`}
          >
            <FormatItalic />
          </IconButton>
          <IconButton
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            sx={{
              borderRadius: "0",
              my: "auto",
              backgroundColor: toolbarState.isUnderline
                ? "#e0e0e0"
                : "transparent",
            }}
            title={`Underline (${SHORTCUTS.UNDERLINE})`}
            type="button"
            aria-label={`Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`}
          >
            <FormatUnderlined />
          </IconButton>
          <IconButton
            disabled={!isEditable}
            onClick={insertLink}
            sx={{
              borderRadius: "0",
              my: "auto",
              backgroundColor: toolbarState.isLink ? "#e0e0e0" : "transparent",
            }}
            aria-label="Insert link"
            title={`Insert link (${SHORTCUTS.INSERT_LINK})`}
            type="button"
          >
            <Link />
          </IconButton>
          <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting text color"
            buttonIconClassName="icon font-color"
            color={toolbarState.fontColor}
            onChange={onFontColorSelect}
            ButtonIcon={FormatColorTextIcon}
            title="text color"
          />
          <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting background color"
            buttonIconClassName="icon bg-color"
            color={toolbarState.bgColor}
            ButtonIcon={FormatColorFill}
            onChange={onBgColorSelect}
            title="bg color"
          />
          <MoreTextFormatMenu
            editor={activeEditor}
            toolbarState={toolbarState}
            disabled={!isEditable}
          />
          {canViewerSeeInsertDropdown && (
            <>
              <Divider />
              <InsertMenu
                editor={editor}
                activeEditor={activeEditor}
                showModal={showModal}
                disabled={!isEditable}
              />
            </>
          )}
        </>
      )}
      <Divider />
      <ElementFormatDropdown
        disabled={!isEditable}
        value={toolbarState.elementFormat}
        editor={activeEditor}
        isRTL={toolbarState.isRTL}
      />

      {modal}
    </Box>
  );
}
