// src/extensions/ColumnComponent.tsx
import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

interface ColumnComponentProps {
  node: {
    attrs: {
      columns: number,
    },
  };
}

const ColumnComponent: React.FC<ColumnComponentProps> = ({ node }) => {
  const { columns } = node.attrs;
  const isThreeColumn = columns === 3;

  return (
    <NodeViewWrapper
      className={isThreeColumn ? "three-column-layout" : "two-column-layout"}
      data-type={isThreeColumn ? "three-column" : "two-column"}
    >
      <NodeViewContent />
    </NodeViewWrapper>
  );
};

export default ColumnComponent;
