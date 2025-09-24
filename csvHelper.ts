import { Book } from '../types';

export const parseCSV = (csvText: string): Book[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    // Remove BOM and clean headers
    const headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Find column indices robustly
    const findIndex = (possibleNames: string[]) => {
        for (const name of possibleNames) {
            const index = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
            if (index !== -1) return index;
        }
        return -1;
    };

    const titleIndex = findIndex(['title', 'name']);
    const authorIndex = findIndex(['author', 'authors']);
    const yearIndex = findIndex(['publicationyear', 'first published year', 'published', 'year']);
    const genreIndex = findIndex(['genre', 'category']);

    if (titleIndex === -1 || authorIndex === -1) {
        // Essential columns are missing
        throw new Error("CSV must contain 'Title' and 'Author' columns.");
    }

    // Fix: Explicitly type the return value of the map callback to `Book | null`.
    // This resolves a type inference issue where the `filter` type predicate `book is Book`
    // was not assignable to the more specific, inferred return type from this `map` function.
    return lines.slice(1).map((line): Book | null => {
        if (!line.trim()) return null;
        // Basic CSV parsing, may not handle all edge cases like commas within quoted fields
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
        return {
            title: values[titleIndex] || 'Unknown',
            author: values[authorIndex] || 'Unknown',
            publicationYear: yearIndex !== -1 ? values[yearIndex] || 'Unknown' : 'Unknown',
            genre: genreIndex !== -1 ? values[genreIndex] || 'Unknown' : 'Unknown',
        };
    }).filter((book): book is Book => book !== null);
};

export const convertToCSV = (data: Book[]): string => {
    const headers = "Title,Author,First Published Year,Genre";
    const rows = data.map(book => 
      `"${String(book.title || '').replace(/"/g, '""')}","${String(book.author || '').replace(/"/g, '""')}",${book.publicationYear},"${String(book.genre || '').replace(/"/g, '""')}"`
    );
    return [headers, ...rows].join('\n');
};
