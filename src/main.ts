import { Plugin, MarkdownView, Notice } from "obsidian";

export default class ExtraLinePlugin extends Plugin {
  async onload() {
    // Notice the { capture: true } at the very end of this listener
    this.registerDomEvent(
      document,
      "keydown",
      (evt: KeyboardEvent) => {
        if (
          evt.key !== "Enter" ||
          evt.shiftKey ||
          evt.ctrlKey ||
          evt.metaKey ||
          evt.altKey
        ) {
          return;
        }

        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        const editor = view.editor;

        const cursor = editor.getCursor();

        // Do not intercept Enter on the title line (first line)
        if (cursor.line === 0) return;

        const lineContent = editor.getLine(cursor.line) ?? "";

        // 匹配开头可能包含空格，接着是 -, *, + 或者数字加点，且后面跟一个空格的行
        const isListItem = /^\s*([-*+]|\d+\.)\s/.test(lineContent);
        // 如果当前行是分点/列表，直接跳出我们的逻辑，让 Obsidian 使用默认的列表换行行为
        if (isListItem) {
          return;
        }

        const isAtLineEnd = cursor.ch === lineContent.length;
        const isAtEmptyLine = lineContent.trim().length === 0;

        if (isAtLineEnd) {
          // 1. Stop default Enter behavior
          evt.preventDefault();
          // 2. Stop the event from reaching CodeMirror
          evt.stopPropagation();

          if (isAtEmptyLine) {
            // Insert two newlines for an extra empty line
            editor.replaceRange("\n\n", cursor);

            // "鼠标往上一行" (Move cursor up one line relative to the very bottom)
            editor.setCursor({
              line: cursor.line + 1,
              ch: 0,
            });
          } else {
            // Insert two newlines for an extra empty line
            editor.replaceRange("\n\n", cursor);

            // Move cursor to the very bottom line
            editor.setCursor({
              line: cursor.line + 2,
              ch: 0,
            });
          }
        }
      },
      { capture: true },
    );
  }
}
