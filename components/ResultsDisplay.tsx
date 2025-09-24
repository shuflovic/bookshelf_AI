import React, { useState } from 'react';
import { Book, AppSettings } from '../types';
import ActionButton from './ActionButton';
import { uploadBooksToSupabase } from '../services/supabaseService';
import { convertToCSV } from '../utils/csvHelper';

interface ResultsDisplayProps {
  imageSrc: string | null;
  books: Book[];
  onReset: () => void;
  settings: AppSettings | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ imageSrc, books, onReset, settings }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const handleDownload = () => {
    const csvData = convertToCSV(books);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = 'book_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadToSupabase = async () => {
    if (!settings?.supabaseUrl || !settings?.supabaseKey) {
        setUploadStatus('error');
        setUploadMessage("Supabase credentials not found. Please configure them in settings.");
        return;
    }
    setUploadStatus('uploading');
    setUploadMessage('');
    try {
      await uploadBooksToSupabase(books, settings.supabaseUrl, settings.supabaseKey);
      setUploadStatus('success');
      setUploadMessage('Successfully uploaded to your Supabase library!');
    } catch (err) {
      setUploadStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setUploadMessage(`Upload failed: ${errorMessage}`);
      console.error(err);
    }
  };

  const showSupabaseButton = settings?.supabaseUrl && settings?.supabaseKey;

  return (
    <div className={`grid grid-cols-1 ${imageSrc ? 'lg:grid-cols-2' : ''} gap-8 animate-fade-in`}>
      {imageSrc && (
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-300">Your Uploaded Image</h3>
          <img 
            src={imageSrc} 
            alt="Uploaded books" 
            className="rounded-lg shadow-lg max-h-[500px] w-auto object-contain"
          />
        </div>
      )}
      <div className={!imageSrc ? 'col-span-1' : ''}>
        <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-md mb-6" role="alert">
          <p className="font-bold">Success!</p>
          <p className="text-sm">Successfully identified and processed {books.length} book(s).</p>
        </div>

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

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <ActionButton onClick={handleDownload} text="Download CSV" primary={false} />
          {showSupabaseButton && (
            <ActionButton
              onClick={handleUploadToSupabase}
              text="Upload to Supabase Library"
              disabled={uploadStatus === 'uploading'}
              primary={false}
            />
          )}
          <ActionButton onClick={onReset} text="Add More Books" primary={true} />
        </div>

        {uploadStatus !== 'idle' && (
            <div className={`mt-4 px-4 py-3 rounded-md text-sm text-center transition-all duration-300
              ${uploadStatus === 'success' ? 'bg-green-900/50 border border-green-700 text-green-300' : ''}
              ${uploadStatus === 'error' ? 'bg-red-900/50 border border-red-700 text-red-300' : ''}
              ${uploadStatus === 'uploading' ? 'bg-blue-900/50 border border-blue-700 text-blue-300' : ''}
            `}>
              {uploadStatus === 'uploading' && <div className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Uploading data to library...</span></div>}
              {uploadMessage}
            </div>
          )}

      </div>
    </div>
  );
};

export default ResultsDisplay;