import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CV_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

export const cvManager = {
  /**
   * Upload CV to Supabase storage
   * @returns path to uploaded CV or null if failed
   */
  async uploadCV(userId: string, file: File): Promise<string | null> {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error("Solo file PDF sono supportati");
      return null;
    }

    if (file.size > CV_SIZE_LIMIT) {
      toast.error("File troppo grande. Max 5MB");
      return null;
    }

    try {
      const fileName = `${userId}/cv_${Date.now()}.pdf`;
      const { error } = await supabase.storage
        .from('cvs')
        .upload(fileName, file);

      if (error) throw error;

      toast.success("CV caricato con successo!");
      return fileName;
    } catch (error: any) {
      console.error('Error uploading CV:', error);
      toast.error(error.message || "Errore nel caricamento");
      return null;
    }
  },

  /**
   * Open CV using signed URL
   */
  async openCV(cvUrl: string): Promise<void> {
    if (!cvUrl) return;

    try {
      // If it's already a full URL, open directly
      if (cvUrl.startsWith('http')) {
        window.open(cvUrl, '_blank');
        return;
      }

      // Otherwise, create signed URL from path
      const path = cvUrl.replace(/^cvs\//, '');
      const { data, error } = await supabase.storage
        .from('cvs')
        .createSignedUrl(path, 60);

      if (error) throw error;
      if (data) window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error opening CV:', error);
      toast.error('Errore nell\'apertura del CV');
    }
  },

  /**
   * Delete CV from storage
   * @returns true if successful
   */
  async deleteCV(cvUrl: string): Promise<boolean> {
    if (!cvUrl) return false;

    try {
      const path = cvUrl.replace(/^cvs\//, '');
      const { error } = await supabase.storage
        .from('cvs')
        .remove([path]);

      if (error) throw error;

      toast.success("CV eliminato");
      return true;
    } catch (error: any) {
      console.error('Error deleting CV:', error);
      toast.error(error.message || "Errore nell'eliminazione");
      return false;
    }
  }
};
