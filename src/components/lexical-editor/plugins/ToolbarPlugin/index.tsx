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
import { Dispatch, useCallback, useEffect, useState } from "react";
import * as React from "react";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import {
  blockTypeToBlockName,
  useToolbarState,
} from "../../context/ToolbarContext";
import useModal from "../../hooks/useModal";
import catTypingGif from "../../images/cat-typing.gif";
import DropDown, { DropDownItem } from "../../ui/DropDown";
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
  ExpandMore,
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
  AlignHorizontalLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatIndentDecrease,
  FormatIndentIncrease,
} from "@mui/icons-material";

import { H1Icon } from "../../icons/H1Icon";
import { H2Icon } from "../../icons/H2Icon";
import { H3Icon } from "../../icons/H3Icon";

import SvgIcon from "@mui/icons-material/FormatColorText";
import { IconButton } from "@mui/material";

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

function dropDownActiveClass(active: boolean) {
  if (active) {
    return "active dropdown-item-active";
  } else {
    return "";
  }
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
  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={"icon block-type " + blockType}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style"
    >
      <DropDownItem
        className={
          "item wide " + dropDownActiveClass(blockType === "paragraph")
        }
        onClick={() => formatParagraph(editor)}
      >
        <div className="icon-text-container">
          <ViewHeadline />
          <span className="text">Normal</span>
        </div>
        <span className="shortcut">{SHORTCUTS.NORMAL}</span>
      </DropDownItem>
      <DropDownItem
        className={"item wide " + dropDownActiveClass(blockType === "h1")}
        onClick={() => formatHeading(editor, blockType, "h1")}
      >
        <div className="icon-text-container">
          <H1Icon />
          <span className="text">Heading 1</span>
        </div>
        <span className="shortcut">{SHORTCUTS.HEADING1}</span>
      </DropDownItem>
      <DropDownItem
        className={"item wide " + dropDownActiveClass(blockType === "h2")}
        onClick={() => formatHeading(editor, blockType, "h2")}
      >
        <div className="icon-text-container">
          <H2Icon />

          <span className="text">Heading 2</span>
        </div>
        <span className="shortcut">{SHORTCUTS.HEADING2}</span>
      </DropDownItem>
      <DropDownItem
        className={"item wide " + dropDownActiveClass(blockType === "h3")}
        onClick={() => formatHeading(editor, blockType, "h3")}
      >
        <div className="icon-text-container">
          <H3Icon />
          <span className="text">Heading 3</span>
        </div>
        <span className="shortcut">{SHORTCUTS.HEADING3}</span>
      </DropDownItem>
      <DropDownItem
        className={"item wide " + dropDownActiveClass(blockType === "bullet")}
        onClick={() => formatBulletList(editor, blockType)}
      >
        <div className="icon-text-container">
          <Circle />
          <span className="text">Bullet List</span>
        </div>
        <span className="shortcut">{SHORTCUTS.BULLET_LIST}</span>
      </DropDownItem>
      <DropDownItem
        className={"item wide " + dropDownActiveClass(blockType === "number")}
        onClick={() => formatNumberedList(editor, blockType)}
      >
        <div className="icon-text-container">
          <Numbers />
          <span className="text">Numbered List</span>
        </div>
        <span className="shortcut">{SHORTCUTS.NUMBERED_LIST}</span>
      </DropDownItem>
      <DropDownItem
        className={"item wide " + dropDownActiveClass(blockType === "check")}
        onClick={() => formatCheckList(editor, blockType)}
      >
        <div className="icon-text-container">
          <CheckBox />
          <span className="text">Check List</span>
        </div>
        <span className="shortcut">{SHORTCUTS.CHECK_LIST}</span>
      </DropDownItem>
      <DropDownItem
        className={"item wide " + dropDownActiveClass(blockType === "quote")}
        onClick={() => formatQuote(editor, blockType)}
      >
        <div className="icon-text-container">
          <FormatQuote />
          <span className="text">Quote</span>
        </div>
        <span className="shortcut">{SHORTCUTS.QUOTE}</span>
      </DropDownItem>
    </DropDown>
  );
}

function Divider(): JSX.Element {
  return <div className="divider" />;
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
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style]
  );

  const buttonAriaLabel =
    style === "font-family"
      ? "Formatting options for font family"
      : "Formatting options for font size";

  return (
    <DropDown
      disabled={disabled}
      buttonClassName={"toolbar-item " + style}
      buttonLabel={value}
      buttonIconClassName={
        style === "font-family" ? "icon block-type font-family" : ""
      }
      buttonAriaLabel={buttonAriaLabel}
    >
      {(style === "font-family" ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
        ([option, text]) => (
          <DropDownItem
            className={`item ${dropDownActiveClass(value === option)} ${
              style === "font-size" ? "fontsize-item" : ""
            }`}
            onClick={() => handleClick(option)}
            key={option}
          >
            <span className="text">{text}</span>
          </DropDownItem>
        )
      )}
    </DropDown>
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
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || "left"];

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={formatOption.name}
      ButtonIcon={FormatAlignCenter}
      buttonClassName="toolbar-item spaced alignment"
      buttonAriaLabel="Formatting options for text alignment"
    >
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <FormatAlignLeft />
          <span className="text">Left Align</span>
        </div>
        <span className="shortcut">{SHORTCUTS.LEFT_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <FormatAlignCenter />
          <span className="text">Center Align</span>
        </div>
        <span className="shortcut">{SHORTCUTS.CENTER_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <FormatAlignRight />
          <span className="text">Right Align</span>
        </div>
        <span className="shortcut">{SHORTCUTS.RIGHT_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <FormatAlignJustify />
          <span className="text">Justify Align</span>
        </div>
        <span className="shortcut">{SHORTCUTS.JUSTIFY_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "start");
        }}
        className="item wide"
      >
        {isRTL
          ? ELEMENT_FORMAT_OPTIONS.start.iconRTL
          : ELEMENT_FORMAT_OPTIONS.start.icon}

        <span className="text">Start Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "end");
        }}
        className="item wide"
      >
        {/* <i
          className={`icon ${
            isRTL
              ? ELEMENT_FORMAT_OPTIONS.end.iconRTL
              : ELEMENT_FORMAT_OPTIONS.end.icon
          }`} */}
        {isRTL
          ? ELEMENT_FORMAT_OPTIONS.end.iconRTL
          : ELEMENT_FORMAT_OPTIONS.end.icon}

        <span className="text">End Align</span>
      </DropDownItem>
      <Divider />
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <FormatIndentDecrease />

          <span className="text">Outdent</span>
        </div>
        <span className="shortcut">{SHORTCUTS.OUTDENT}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          {isRTL ? <FormatIndentDecrease /> : <FormatIndentIncrease />}
          <span className="text">Indent</span>
        </div>
        <span className="shortcut">{SHORTCUTS.INDENT}</span>
      </DropDownItem>
    </DropDown>
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
    <div className="toolbar" style={{ height: "80px" }}>
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
        <DropDown
          disabled={!isEditable}
          buttonClassName="toolbar-item code-language"
          buttonLabel={getLanguageFriendlyName(toolbarState.codeLanguage)}
          buttonAriaLabel="Select language"
        >
          {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
            return (
              <DropDownItem
                className={`item ${dropDownActiveClass(
                  value === toolbarState.codeLanguage
                )}`}
                onClick={() => onCodeLanguageSelect(value)}
                key={value}
              >
                <span className="text">{name}</span>
              </DropDownItem>
            );
          })}
        </DropDown>
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
          {/* {canViewerSeeInsertCodeButton && (
            <IconButton
sx={{
          borderRadius: "0",
          my: "auto",
        }}
              disabled={!isEditable}
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
              }}
              className={
                "toolbar-item spaced " + (toolbarState.isCode ? "active" : "")
              }
              title={`Insert code block (${SHORTCUTS.INSERT_CODE_BLOCK})`}
              type="button"
              aria-label="Insert code block"
            >
              <i className="format code" />
            </IconButton>
          )} */}
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
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            ButtonIcon={MoreHoriz}
            buttonLabel=""
            buttonAriaLabel="Formatting options for additional text styles"
            buttonIconClassName="icon dropdown-more"
          >
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "lowercase");
              }}
              className={
                "item wide " + dropDownActiveClass(toolbarState.isLowercase)
              }
              title="Lowercase"
              aria-label="Format text to lowercase"
            >
              <div className="icon-text-container">
                <i className="icon lowercase" />
                <span className="text">Lowercase</span>
              </div>
              <span className="shortcut">{SHORTCUTS.LOWERCASE}</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "uppercase");
              }}
              className={
                "item wide " + dropDownActiveClass(toolbarState.isUppercase)
              }
              title="Uppercase"
              aria-label="Format text to uppercase"
            >
              <div className="icon-text-container">
                <i className="icon uppercase" />
                <span className="text">Uppercase</span>
              </div>
              <span className="shortcut">{SHORTCUTS.UPPERCASE}</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "capitalize");
              }}
              className={
                "item wide " + dropDownActiveClass(toolbarState.isCapitalize)
              }
              title="Capitalize"
              aria-label="Format text to capitalize"
            >
              <div className="icon-text-container">
                <i className="icon capitalize" />
                <span className="text">Capitalize</span>
              </div>
              <span className="shortcut">{SHORTCUTS.CAPITALIZE}</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(
                  FORMAT_TEXT_COMMAND,
                  "strikethrough"
                );
              }}
              className={
                "item wide " + dropDownActiveClass(toolbarState.isStrikethrough)
              }
              title="Strikethrough"
              aria-label="Format text with a strikethrough"
            >
              <div className="icon-text-container">
                <i className="icon strikethrough" />
                <span className="text">Strikethrough</span>
              </div>
              <span className="shortcut">{SHORTCUTS.STRIKETHROUGH}</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
              }}
              className={
                "item wide " + dropDownActiveClass(toolbarState.isSubscript)
              }
              title="Subscript"
              aria-label="Format text with a subscript"
            >
              <div className="icon-text-container">
                <i className="icon subscript" />
                <span className="text">Subscript</span>
              </div>
              <span className="shortcut">{SHORTCUTS.SUBSCRIPT}</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(
                  FORMAT_TEXT_COMMAND,
                  "superscript"
                );
              }}
              className={
                "item wide " + dropDownActiveClass(toolbarState.isSuperscript)
              }
              title="Superscript"
              aria-label="Format text with a superscript"
            >
              <div className="icon-text-container">
                <i className="icon superscript" />
                <span className="text">Superscript</span>
              </div>
              <span className="shortcut">{SHORTCUTS.SUPERSCRIPT}</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight");
              }}
              className={
                "item wide " + dropDownActiveClass(toolbarState.isHighlight)
              }
              title="Highlight"
              aria-label="Format text with a highlight"
            >
              <div className="icon-text-container">
                <i className="icon highlight" />
                <span className="text">Highlight</span>
              </div>
            </DropDownItem>
            <DropDownItem
              onClick={() => clearFormatting(activeEditor)}
              className="item wide"
              title="Clear text formatting"
              aria-label="Clear all text formatting"
            >
              <div className="icon-text-container">
                <i className="icon clear" />
                <span className="text">Clear Formatting</span>
              </div>
              <span className="shortcut">{SHORTCUTS.CLEAR_FORMATTING}</span>
            </DropDownItem>
          </DropDown>
          {canViewerSeeInsertDropdown && (
            <>
              <Divider />
              <DropDown
                disabled={!isEditable}
                buttonClassName="toolbar-item spaced"
                buttonLabel="Insert"
                buttonAriaLabel="Insert specialized editor node"
                buttonIconClassName="icon plus"
                ButtonIcon={Add}
              >
                <DropDownItem
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      INSERT_HORIZONTAL_RULE_COMMAND,
                      undefined
                    );
                  }}
                  className="item"
                >
                  <HorizontalRule />
                  <span className="text">Horizontal Rule</span>
                </DropDownItem>
                <DropDownItem
                  onClick={() => {
                    activeEditor.dispatchCommand(INSERT_PAGE_BREAK, undefined);
                  }}
                  className="item"
                >
                  <InsertPageBreak />
                  <span className="text">Page Break</span>
                </DropDownItem>
                <DropDownItem
                  onClick={() => {
                    showModal("Insert Image", (onClose) => (
                      <InsertImageDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}
                  className="item"
                >
                  <Image />
                  <span className="text">Image</span>
                </DropDownItem>
                <DropDownItem
                  onClick={() => {
                    showModal("Insert Inline Image", (onClose) => (
                      <InsertInlineImageDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}
                  className="item"
                >
                  <ArtTrack />
                  <span className="text">Inline Image</span>
                </DropDownItem>

                <DropDownItem
                  onClick={() => {
                    showModal("Insert Table", (onClose) => (
                      <InsertTableDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}
                  className="item"
                >
                  <CalendarViewMonth />
                  <span className="text">Table</span>
                </DropDownItem>

                <DropDownItem
                  onClick={() => {
                    showModal("Insert Columns Layout", (onClose) => (
                      <InsertLayoutDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}
                  className="item"
                >
                  <ViewColumn />
                  <span className="text">Columns Layout</span>
                </DropDownItem>

                {/* <DropDownItem
                  onClick={() => {
                    editor.update(() => {
                      const root = $getRoot();
                      const stickyNode = $createStickyNode(0, 0);
                      root.append(stickyNode);
                    });
                  }}
                  className="item">
                  <i className="icon sticky" />
                  <span className="text">Sticky Note</span>
                </DropDownItem> */}
                <DropDownItem
                  onClick={() => {
                    editor.dispatchCommand(
                      INSERT_COLLAPSIBLE_COMMAND,
                      undefined
                    );
                  }}
                  className="item"
                >
                  <ChevronRight />
                  <span className="text">Collapsible container</span>
                </DropDownItem>
                {EmbedConfigs.map((embedConfig) => (
                  <DropDownItem
                    key={embedConfig.type}
                    onClick={() => {
                      activeEditor.dispatchCommand(
                        INSERT_EMBED_COMMAND,
                        embedConfig.type
                      );
                    }}
                    className="item"
                  >
                    {embedConfig.icon}
                    <span className="text">{embedConfig.contentName}</span>
                  </DropDownItem>
                ))}
              </DropDown>
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
    </div>
  );
}
