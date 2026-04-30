/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DRAG_DROP_PASTE } from "@lexical/rich-text";
import { isMimeType } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW } from "lexical";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { useUploadFile } from "@/hooks/use-upload-file";
import { INSERT_IMAGE_COMMAND } from "../ImagesPlugin";

const ACCEPTABLE_IMAGE_TYPES = [
  "image/",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/webp",
];

export default function DragDropPaste(): null {
  const [editor] = useLexicalComposerContext();
  const { uploadToS3 } = useUploadFile();

  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        (async () => {
          for (const file of files) {
            if (!isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) continue;

            try {
              const result = await uploadToS3(file);
              if (result?.url) {
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                  altText: file.name,
                  src: result.url,
                });
              } else {
                const message =
                  (result as { error?: Error })?.error?.message ||
                  `Failed to upload ${file.name}`;
                toast.error(message);
              }
            } catch (err) {
              console.error("Drag/drop/paste upload failed:", err);
              toast.error(
                (err as Error)?.message || `Failed to upload ${file.name}`,
              );
            }
          }
        })();
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, uploadToS3]);
  return null;
}
