import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MAX_CV_SIZE = 5 * 1024 * 1024; // 5MB

export const useCVManager = (userId: string) => {
  const [uploading, setUploading] = useState(false);

  const uploadCV = async (file: File): Promise<string | null> => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error("Solo file PDF sono supportati");
      return null;
    }

    if (file.size > MAX_CV_SIZE) {
      toast.error("File troppo grande. Max 5MB");
      return null;
    }

    setUploading(true);
    try {
      const fileName = `${userId}/cv_${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast.success("CV caricato con successo!");
      return fileName;
    } catch (error: any) {
      console.error('CV upload error:', error);
      toast.error(error.message || "Errore nel caricamento del CV");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const openCV = async (cvPath: string | null): Promise<void> => {
    if (!cvPath) {
      toast.error("Nessun CV disponibile");
      return;
    }

    try {
      // Handle both full URLs and storage paths
      if (cvPath.startsWith('http')) {
        window.open(cvPath, "_blank");
        return;
      }

      const path = cvPath.includes("/cvs/") 
        ? cvPath.split("/cvs/")[1] 
        : cvPath;
        
      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(path, 60);
        
      if (error) throw error;
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      console.error('Error opening CV:', error);
      toast.error("Impossibile aprire il CV");
    }
  };

  const deleteCV = async (cvPath: string): Promise<boolean> => {
    try {
      const path = cvPath.includes("/cvs/") 
        ? cvPath.split("/cvs/")[1] 
        : cvPath;

      const { error } = await supabase.storage
        .from('cvs')
        .remove([path]);

      if (error) throw error;

      toast.success("CV eliminato");
      return true;
    } catch (error: any) {
      console.error('CV deletion error:', error);
      toast.error("Errore nell'eliminazione del CV");
      return false;
    }
  };

  return { uploadCV, openCV, deleteCV, uploading };
};
