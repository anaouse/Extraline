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
        const lineContent = editor.getLine(cursor.line) ?? "";

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
