import { createClient } from '@supabase/supabase-js';

export const uploadCsvToSupabase = async (csvData: string, fileName: string, supabaseUrl: string, supabaseKey: string): Promise<void> => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key not provided.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-t;' });
  const bucketName = 'library';

  // Use upsert to create the file if it doesn't exist, or overwrite it if it does.
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, blob, {
        upsert: true,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    if (error.message.includes("Bucket not found")) {
        throw new Error(`Storage bucket "${bucketName}" not found in your Supabase project.`);
    }
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  console.log("Supabase upload successful:", data);
};


export const listFilesFromLibrary = async (supabaseUrl: string, supabaseKey: string) => {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.storage.from('library').list('', {
        sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
        console.error("Error listing files:", error);
        throw new Error(`Could not list files from Supabase: ${error.message}`);
    }
    return data;
};

export const downloadFileContent = async (fileName: string, supabaseUrl: string, supabaseKey: string) => {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.storage.from('library').download(fileName);
    if (error) {
        console.error("Error downloading file:", error);
        throw new Error(`Could not download file: ${error.message}`);
    }
    return data.text();
};


export const deleteFileFromLibrary = async (fileName: string, supabaseUrl: string, supabaseKey: string) => {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.storage.from('library').remove([fileName]);
    if (error) {
        console.error("Error deleting file:", error);
        throw new Error(`Could not delete file: ${error.message}`);
    }
};