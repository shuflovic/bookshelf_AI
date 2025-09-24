# Book Identifier AI 📖✨

**Your personal AI-powered librarian.**

This application helps you quickly and easily digitize your physical book collection. Just show it your books, and it will create a neat, organized list for you.

---

### What Does This App Do?

This tool is designed to be a simple, three-step solution for cataloging your books:

1.  **Identify Your Books with AI:** Take a picture of your bookshelf or a stack of books, and the app's AI will identify each book, pulling out details like the title, author, publication year, and genre.
2.  **Upload Existing Lists:** If you already have your books in a spreadsheet (`.csv`) or a text file (`.txt`), you can upload it directly to add it to your digital library.
3.  **Manage Your Digital Library:** Save your book collections to the cloud and view them anytime. You can browse individual collections or see all of your books consolidated into one master list.

---

### How It Works: A Simple Guide

The app is organized into three simple steps, which you can access from the main navigation menu.

#### Step 1: Get Set Up (Settings)

Before you can start, you need to provide your "keys" to unlock the app's powerful features.

*   **Google Gemini API Key (Required):** Think of this as a password that gives the app permission to use Google's powerful AI "brain." The AI is what reads the images of your books.
*   **Supabase Keys (Optional):** If you want to save your book collections online, you can provide keys to a service called Supabase. This creates a secure, private "bookshelf" for you in the cloud. If you don't provide these, you can still identify books and download the lists to your computer.

#### Step 2: Add Your Books

This is where the magic happens. You have a few options to add books:

*   **Use Your Camera:** Click the "Use Your Camera" button to take a live photo of your books.
*   **Upload a Photo:** Use a picture you already have saved on your device.
*   **Upload a File:** Directly upload a `.csv` or `.txt` file containing a list of your books.

Once you've uploaded something, the app will process it and show you a clean table of the results. From there, you can download the list or save it to your Supabase library.

#### Step 3: See Your Library

If you've set up Supabase, this is where you can view all your saved collections.

*   **Browse Collections:** See a list of all the individual files you've uploaded. Click on any file to see its contents.
*   **View All Books:** Click the "View All" button to combine every book from all your files into a single, master list. This is perfect for getting a complete overview of your entire collection.
*   **Manage:** You can easily delete old collections you no longer need.

---

### Technical Deep Dive for Developers

This section outlines the technical architecture, data flow, and key implementation details of the application.

#### **1. Core Technologies**

*   **Frontend Framework:** [React](https://reactjs.org/) (using functional components and hooks)
*   **Language:** [TypeScript](https://www.typescriptlang.org/) for type safety
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (loaded via CDN for simplicity)
*   **AI Model:** Google Gemini (`gemini-2.5-flash`) via the `@google/genai` SDK
*   **Cloud Storage:** [Supabase Storage](https://supabase.com/storage) via the `@supabase/supabase-js` SDK

#### **2. Application Architecture**

The application is a client-side Single Page Application (SPA) built around a component-based architecture.

*   **`App.tsx`**: The root component. It manages the global application state, including the current view (`AppView`) and the user's settings (`AppSettings`). It reads settings from `localStorage` on startup and passes them down to child components via props. It acts as a simple router, rendering the correct view (`Settings`, `UploadView`, or `LibraryViewer`) based on the current state.

*   **`types.ts`**: A central file that defines all major data structures (`Book`, `AppSettings`) and enums (`UploadState`), ensuring type consistency across the application.

*   **State Management**: State is managed locally within components using `useState`, `useEffect`, and `useCallback` hooks. There is no global state manager like Redux or Zustand; state is passed down through props or managed in the component where it's most relevant.

#### **3. Key Components & Logic**

*   **`/components`**:
    *   **`Settings.tsx`**: A controlled form for capturing the user's Gemini API Key and optional Supabase credentials. On save, it updates `localStorage`, which triggers a state update in the root `App.tsx` component.
    *   **`UploadView.tsx`**: Acts as a state machine for the entire book addition workflow. It manages the `UploadState` enum (`IDLE`, `TAKING_PICTURE`, `PROCESSING`, `RESULTS`, `ERROR`) and renders the appropriate child component for each state.
    *   **`FileUploader.tsx`**: Provides the UI for file input, including drag-and-drop functionality and a button to activate the camera view.
    *   **`CameraCapture.tsx`**: Interfaces with the browser's MediaDevices API (`navigator.mediaDevices.getUserMedia`) to stream video. It captures a frame onto a `<canvas>` element, converts it to a JPEG data URL, and then transforms it into a `File` object for processing.
    *   **`ResultsDisplay.tsx`**: Renders the identified `Book[]` array in a table. It handles the logic for downloading the data as a CSV and orchestrates the UI for saving the collection to Supabase.
    *   **`LibraryViewer.tsx`**: The most complex component. It manages all interactions with the Supabase library, including fetching the file list, downloading and displaying content, deleting files, and handling the full edit-in-place functionality (modifying, adding, and deleting rows).

*   **`/services`**:
    *   **`geminiService.ts`**: This is the heart of the AI functionality. The `identifyBooksFromImage` function:
        1.  Receives a base64-encoded image string and the API key.
        2.  Constructs a request for the `gemini-2.5-flash` model.
        3.  **Crucially, it enforces a structured JSON output.** It sets `responseMimeType: "application/json"` and provides a strict `responseSchema`. This ensures the Gemini API returns a predictable JSON array of book objects, eliminating the need for fragile text parsing on the client side.
        4.  Parses the JSON response and maps it to the `Book[]` type.
    *   **`supabaseService.ts`**: This module abstracts all interactions with Supabase Storage. It uses the Supabase client library to perform CRUD operations on files within the `library` bucket. The `uploadCsvToSupabase` function notably uses `upsert: true` to allow for both creating new files and overwriting existing ones, which is key for the "Save Changes" feature.

*   **`/utils`**:
    *   **`csvHelper.ts`**: Contains pure functions for data manipulation.
        *   `parseCSV`: A robust CSV parser that handles headers with different possible names (e.g., "publicationYear" vs. "Published") and values that may or may not be quoted.
        *   `convertToCSV`: Converts a `Book[]` array back into a valid CSV string, correctly handling and escaping quotes within data fields.
        *   `mergeBooks`: Implements the de-duplication logic when adding new books to an existing collection, preventing duplicate entries.

#### **4. Data Flow Example: Image to Library**

1.  **Capture**: User uploads an image via `FileUploader.tsx`. The `File` object is passed to `UploadView.tsx`.
2.  **Processing**: `UploadView` sets its state to `PROCESSING`. It reads the `File` as a data URL and extracts the base64 string.
3.  **AI Interaction**: The base64 string and API key are sent to `geminiService.identifyBooksFromImage`.
4.  **Structured Response**: The service makes an API call to Gemini, which returns a structured JSON string based on the provided schema.
5.  **State Update**: The service parses the JSON into a `Book[]` array and returns it to `UploadView`. `UploadView` updates its state with the book data and transitions to the `RESULTS` state.
6.  **Display**: `ResultsDisplay.tsx` receives the `Book[]` array as a prop and renders the data table.
7.  **Save to Cloud**: User clicks "Save to Library".
    a. `ResultsDisplay` shows the save UI.
    b. On confirmation, it calls `convertToCSV` from `csvHelper.ts` to serialize the `Book[]` data.
    c. The resulting CSV string and a filename are passed to `supabaseService.uploadCsvToSupabase`.
    d. The service uploads the file to the Supabase Storage bucket.
