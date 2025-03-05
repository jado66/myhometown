// src/extensions/ColumnExtension.ts
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ColumnComponent from './ColumnComponent'

export interface ColumnOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    column: {
      setTwoColumns: () => ReturnType
      setThreeColumns: () => ReturnType
    }
  }
}

export const TwoColumnExtension = Node.create<ColumnOptions>({
  name: 'twoColumn',
  group: 'block',
  content: 'block+',
  draggable: true,

  addAttributes() {
    return {
      columns: {
        default: 2,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="two-column"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'two-column', class: 'two-column-layout' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnComponent)
  },

  addCommands() {
    return {
      setTwoColumns:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Column 1 content' }]
              },
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Column 2 content' }]
              }
            ]
          })
        },
    }
  },
})

export const ThreeColumnExtension = Node.create<ColumnOptions>({
  name: 'threeColumn',
  group: 'block',
  content: 'block+',
  draggable: true,

  addAttributes() {
    return {
      columns: {
        default: 3,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="three-column"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'three-column', class: 'three-column-layout' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnComponent)
  },

  addCommands() {
    return {
      setThreeColumns:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Column 1 content' }]
              },
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Column 2 content' }]
              },
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Column 3 content' }]
              }
            ]
          })
        },
    }
  },
})