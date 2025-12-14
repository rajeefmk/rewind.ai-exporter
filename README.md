# Rewind Exporter (Electron App)

> **DISCLAIMER:** This is an **unofficial** tool created by the open-source community. It is **not** associated with, endorsed by, or affiliated with Rewind.ai or its parent company. Use this tool at your own risk. The authors are not liable for any data loss, corruption, or other issues that may arise from its use.

## Download
[**Download Latest Version (.dmg)**](https://github.com/rajeefmk/rewind.ai-exporter/releases)

A user-friendly macOS Desktop Application to export your [Rewind](https://rewind.ai) history into a single `.mp4` file, completely locally.

## Features
*   **Simple GUI**: No command line required.
*   **Size Estimation**: Check how large your export will be before starting.
*   **Progress Tracking**: Real-time progress bar during export.
*   **Privacy First**: Runs entirely on your machine.

## Installation

### From Source
1.  Clone the repository:
    ```bash
    git clone https://github.com/rajeefmk/rewind.ai-exporter.git
    cd rewind-ai-exporter
    ```
2.  Install dependencies:
    ```bash
    yarn install
    ```
3.  Start the app:
    ```bash
    yarn start
    ```

### Building the App
To create a standard macOS `.dmg` installer:

```bash
yarn build
```

The installer will be located in the `dist/` directory.

## Installation & Troubleshooting

**Note for macOS Users:**
Because this is a free, open-source tool and not signed with a paid Apple Developer ID, macOS may block the application from opening by default, stating it is "damaged" or "from an unidentified developer".

**To open the app:**
1.  **Right-click** (or Control-click) the `Rewind Exporter` app icon.
2.  Select **Open** from the context menu.
3.  Click **Open** in the dialog box that appears.

You only need to do this once. After that, the app will open normally.

## Usage
1.  Open the application.
2.  Click **"Get Size Estimate"** to see the total size of your Rewind history.
3.  Click **"Export to MP4"**.
4.  Choose a location to save your video.
5.  Wait for the progress bar to complete.

## License
MIT