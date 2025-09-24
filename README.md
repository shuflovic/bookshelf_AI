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

### The Magic Behind the Scenes (For the Curious)

Even though it's simple to use, the app is powered by some very advanced technology.

*   **The "Brain":** The core book identification feature uses **Google's Gemini AI**. It's a state-of-the-art model that can understand the contents of images.
*   **The "Bookshelf":** Your online library is powered by **Supabase Storage**, a secure and reliable cloud storage service.
*   **The "Look and Feel":** The app is built as a modern web application using **React** and **Tailwind CSS**, making it fast, responsive, and beautiful on any device.
