
import React, { useState, useEffect, useCallback } from 'react';
import { AppSettings, Book } from '../types';
import { listFilesFromLibrary, downloadFileContent, deleteFileFromLibrary } from '../services/supabaseService';
import Spinner from './Spinner';
import ActionButton from './ActionButton';
import { FileObject } from '@supabase/storage-js';
import { parseCSV } from '../utils/csvHelper';

interface LibraryViewerProps {
    settings: AppSettings | null;
}

const LibraryViewer: React.FC<LibraryViewerProps> = ({ settings }) => {
    const [files, setFiles] = useState<FileObject[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<'list' | 'content' | false>(false);
    const [error, setError] = useState<string | null>(null);
    const [isViewAllActive, setIsViewAllActive] = useState<boolean>(false);
    
    const loadFiles = useCallback(async () => {
        if (!settings?.supabaseUrl || !settings?.supabaseKey) {
            setError("Supabase credentials are not configured.");
            return;
        }
        setLoading('list');
        setError(null);
        try {
            const fileList = await listFilesFromLibrary(settings.supabaseUrl, settings.supabaseKey);
            setFiles(fileList);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to load library: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [settings]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    // Auto-activate View All when files are loaded
    useEffect(() => {
        if (files.length > 0 && !selectedFile && !isViewAllActive && !loading) {
            handleViewAll();
        }
    }, [files, selectedFile, isViewAllActive, loading]);

    const handleFileSelect = async (file: FileObject) => {
        if (!settings?.supabaseUrl || !settings?.supabaseKey) return;
        setLoading('content');
        setSelectedFile(file);
        setIsViewAllActive(false);
        setError(null);
        try {
            const content = await downloadFileContent(file.name, settings.supabaseUrl, settings.supabaseKey);
            const parsedBooks = parseCSV(content);
            setBooks(parsedBooks);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to load file content: ${errorMessage}`);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleViewAll = async () => {
        if (!settings?.supabaseUrl || !settings?.supabaseKey || files.length === 0) return;

        setLoading('content');
        setSelectedFile(null);
        setIsViewAllActive(true);
        setError(null);
        setBooks([]);

        try {
            const allBookPromises = files.map(file => 
                downloadFileContent(file.name, settings.supabaseUrl!, settings.supabaseKey!)
                    .then(content => parseCSV(content))
            );

            const allBooksArrays = await Promise.all(allBookPromises);
            const combinedBooks = allBooksArrays.flat();
            
            setBooks(combinedBooks);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to load all collections: ${errorMessage}`);
            setBooks([]);
            setIsViewAllActive(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!settings?.supabaseUrl || !settings?.supabaseKey) return;

        if (window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
            try {
                await deleteFileFromLibrary(fileName, settings.supabaseUrl, settings.supabaseKey);
                handleRefresh();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Failed to delete file: ${errorMessage}`);
            }
        }
    };
    
    const handleRefresh = () => {
        setSelectedFile(null);
        setBooks([]);
        setIsViewAllActive(false);
        loadFiles();
    };

    if (loading === 'list') {
        return <Spinner message="Loading your library..." />;
    }

    if (error && files.length === 0) {
        return (
            <div className="text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <ActionButton onClick={loadFiles} text="Retry" primary />
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-200">My Library</h2>
                <button onClick={handleRefresh} className="p-2 text-gray-400 hover:text-white transition-colors duration-200" aria-label="Refresh library list">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 9.5M20 20l-1.5-1.5A9 9 0 003.5 14.5" /></svg>
                </button>
            </div>

            {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

            {files.length === 0 && !loading && (
                 <div className="text-center py-10 px-4 bg-gray-900/50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0A2.25 2.25 0 015.625 7.5h12.75c1.131 0 2.162.8 2.344 1.932m-16.5 0a2.25 2.25 0 00-1.883 2.542m16.5 0a2.25 2.25 0 01-1.883 2.542m0 0v6a2.25 2.25 0 01-2.25 2.25H5.625a2.25 2.25 0 01-2.25-2.25v-6m16.5 0v-2.25a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25v2.25" /></svg>
                    <h3 className="mt-2 text-lg font-medium text-white">Your library is empty.</h3>
                    <p className="mt-1 text-sm text-gray-400">Upload a book collection to see it here.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {files.length > 0 && (
                    <div className="md:col-span-1 bg-gray-900/50 rounded-lg border border-gray-700 p-4 h-fit max-h-[60vh] overflow-y-auto">
                        <h3 className="font-semibold text-gray-300 mb-2 text-sm uppercase tracking-wider">Collections</h3>
                         <button 
                            onClick={handleViewAll} 
                            disabled={files.length === 0}
                            className={`w-full text-left p-2 rounded-md mb-2 font-semibold transition-colors flex items-center gap-2 ${
                                isViewAllActive 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            <span>View All ({files.length})</span>
                        </button>
                        <div className="border-t border-gray-700 my-2"></div>
                        <ul>
                            {files.map(file => (
                                <li key={file.id} className="group flex justify-between items-center rounded-md hover:bg-blue-900/50 transition-colors">
                                    <button onClick={() => handleFileSelect(file)} className={`w-full text-left p-2 rounded-md truncate ${!isViewAllActive && selectedFile?.id === file.id ? 'text-blue-400 font-semibold' : 'text-gray-300'}`}>
                                        {file.name}
                                    </button>
                                     <button onClick={() => handleDelete(file.name)} className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" aria-label={`Delete ${file.name}`}>
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                     </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="md:col-span-2">
                    {loading === 'content' && <Spinner message="Loading collection..." />}
                    {(selectedFile || isViewAllActive) && !loading && books.length > 0 && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-300 mb-4">
                                {isViewAllActive ? `All Books (${books.length})` : `Contents of ${selectedFile?.name}`}
                            </h4>
                            <div className="overflow-x-auto bg-gray-900/60 rounded-lg border border-gray-700">
                                <table className="min-w-full text-sm text-left text-gray-300">
                                    <thead className="text-xs text-gray-200 uppercase bg-gray-700/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Title</th>
                                        <th scope="col" className="px-6 py-3">Author</th>
                                        <th scope="col" className="px-6 py-3">First Published</th>
                                        <th scope="col" className="px-6 py-3">Genre</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {books.map((book, index) => (
                                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{book.title}</td>
                                        <td className="px-6 py-4">{book.author}</td>
                                        <td className="px-6 py-4">{book.publicationYear}</td>
                                        <td className="px-6 py-4">{book.genre}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    )}
                     {((selectedFile || isViewAllActive)) && !loading && books.length === 0 && !error && (
                        <p>This collection appears to be empty or in an incorrect format.</p>
                     )}
                     {!selectedFile && !isViewAllActive && files.length > 0 && !loading && (
                        <div className="text-center py-10 px-4 h-full flex flex-col items-center justify-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                           <h3 className="mt-2 text-lg font-medium text-white">Select a Collection</h3>
                           <p className="mt-1 text-sm text-gray-400">Choose a file from the list or 'View All' to see its contents.</p>
                       </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default LibraryViewer;
