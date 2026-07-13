# Custom Workspace Rules

## Dropzone Clipboard Focus Rule
- When designing dropzones that support clipboard pasting (`Ctrl + V`), never bind the file input `click` trigger to the entire container. Doing so opens the file selection dialog when the user clicks the box to focus it for pasting.
- Bind the file selection click event only to a specific sub-element (e.g. a "dosya seç" / "browse file" link/span) and call `stopPropagation()`.

## Local Credentials Rule
- During local testing and experimental features involving API keys (such as Gemini API key), embed or hardcode credentials locally but ensure that modifications containing the key are never pushed to the remote repository (VCS / Git).
