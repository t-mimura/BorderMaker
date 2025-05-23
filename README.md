# Image Border Application

This is an Electron application designed to help users easily add customizable borders to their images. Users can select multiple images, define the thickness of an inner black border and an outer white border, preview the result, and then save the processed images to a designated folder.

## Features

*   **Select Multiple Images:** Supports selection of multiple images at once (formats: JPG, JPEG, PNG, BMP, GIF).
*   **Customizable Borders:**
    *   Define the thickness of an inner black border.
    *   Define the thickness of an outer white border.
*   **Live Preview:** Shows a preview of the first selected image with the currently configured border settings. The preview updates automatically as border values are changed.
*   **Output Folder Selection:** Allows users to choose a specific folder where the processed images will be saved.
*   **Process and Save:** Applies the configured borders to all selected images and saves them.
*   **Filename Preservation:** Saved images retain their original filenames, with a "_bordered" suffix added before the extension (e.g., `myimage.jpg` becomes `myimage_bordered.jpg`).

## How to Use

1.  **Select Images:** Click the "Select Images" button to open a file dialog. Choose one or more images you want to process. The names of the selected files will appear below the button.
2.  **Configure Borders:**
    *   Enter the desired thickness (in pixels) for the "Inner Black Border".
    *   Enter the desired thickness (in pixels) for the "Outer White Border".
3.  **Preview:** The first image you selected will be displayed in the "Preview" area. The preview will update automatically if you change the border thickness values.
4.  **Choose Output Folder:** Click the "Choose Output Folder" button and select the directory where you want to save the processed images. The chosen path will be displayed.
5.  **Process and Save:** Once you have selected your images, configured the borders, and chosen an output folder, click the "Process and Save Images" button.
    *   The application will process each selected image, adding the specified borders.
    *   A status message will indicate the progress and completion.
    *   The processed images will be saved in the selected output folder with "_bordered" added to their original names.

## Technology Stack

*   **Electron:** For building the cross-platform desktop application.
*   **HTML:** For the structure of the user interface.
*   **JavaScript:** For the application logic (both main and renderer processes).
*   **Node.js:** For file system operations and package management.

## How to Run

1.  **Prerequisites:**
    *   Node.js and npm (or yarn) must be installed.
    *   Electron must be installed (it's listed in `devDependencies`, so `npm install` should handle it).

2.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

3.  **Install dependencies:**
    Open a terminal in the project's root directory and run:
    ```bash
    npm install
    ```

4.  **Start the application:**
    After the dependencies are installed, run:
    ```bash
    npm start
    ```
    This will launch the Image Border Application.
