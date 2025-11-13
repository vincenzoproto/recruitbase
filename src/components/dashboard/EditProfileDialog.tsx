import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";
import { CoreValuesSelector } from "@/components/ui/core-values-selector";
import { cvManager } from "@/lib/cvManager";
import type { Profile } from "@/types";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onSuccess: () => void;
}

const EditProfileDialog = ({ open, onOpenChange, profile, onSuccess }: EditProfileDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [cvUrl, setCvUrl] = useState(profile.cv_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    city: profile.city || "",
    job_title: profile.job_title || "",
    bio: profile.bio || "",
    skills: profile.skills?.join(", ") || "",
    linkedin_url: profile.linkedin_url || "",
    phone_number: profile.phone_number || "",
    years_experience: profile.years_experience || 0,
    education: profile.education || "",
    languages: profile.languages || "",
    availability: profile.availability || "",
    company_size: profile.company_size || "",
    industry: profile.industry || "",
    degree_title: profile.degree_title || "",
  });
  const [coreValues, setCoreValues] = useState<string[]>(profile.core_values || []);

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Carica solo immagini");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      toast.success("Foto caricata!");
    } catch (error: any) {
      toast.error(error.message || "Errore nel caricamento");
    } finally {
      setUploading(false);
    }
  };

  const uploadCV = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error("Solo file PDF sono supportati");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File troppo grande. Max 5MB");
      return;
    }

    setUploadingCv(true);
    try {
      const fileName = `${profile.id}/cv_${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save only the path, not the full URL
      setCvUrl(fileName);
      toast.success("CV caricato! Ricordati di salvare le modifiche");
    } catch (error: any) {
      toast.error(error.message || "Errore nel caricamento");
    } finally {
      setUploadingCv(false);
    }
  };

  const openCV = async () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const languagesArray = formData.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          city: formData.city,
          job_title: formData.job_title,
          bio: formData.bio,
          skills: skillsArray,
          linkedin_url: formData.linkedin_url,
          phone_number: formData.phone_number,
          avatar_url: avatarUrl,
          cv_url: cvUrl || null,
          core_values: coreValues,
          years_experience: formData.years_experience || 0,
          education: formData.education || "",
          languages: formData.languages || "",
          availability: formData.availability || null,
          company_size: formData.company_size || "",
          industry: formData.industry || "",
          degree_title: formData.degree_title || "",
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Profilo aggiornato con successo!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Errore nell'aggiornamento del profilo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Profilo</DialogTitle>
          <DialogDescription>Aggiorna le tue informazioni professionali</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{profile.full_name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Caricamento..." : "Carica Foto"}
            </Button>
          </div>

          {/* CV Upload for Candidates */}
          {profile.role === 'candidate' && (
            <div className="space-y-2 p-4 bg-accent/30 rounded-lg">
              <Label htmlFor="cv">Curriculum Vitae (PDF)</Label>
              <input
                ref={cvInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadCV(file);
                }}
              />
              {cvUrl ? (
                <div className="flex items-center justify-between p-3 bg-background rounded border">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">CV caricato</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openCV}
                    >
                      Visualizza
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => cvInputRef.current?.click()}
                      disabled={uploadingCv}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={uploadingCv}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingCv ? "Caricamento..." : "Carica CV (PDF)"}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Carica il tuo CV (PDF, max 5MB) per aumentare la visibilità del profilo
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="es. Roma"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Ruolo</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="es. Frontend Developer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Esperienze</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Racconta la tua esperienza professionale..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Competenze (separate da virgola)</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="es. JavaScript, React, Node.js"
            />
          </div>

          <CoreValuesSelector
            selectedValues={coreValues}
            onChange={setCoreValues}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://www.linkedin.com/in/tuoprofilo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Telefono (con prefisso)</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+39 333 1234567"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="years_experience">Anni di Esperienza</Label>
              <Input
                id="years_experience"
                type="number"
                min="0"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                placeholder="es. 5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Titolo di Studio</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="es. Laurea in Informatica"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="degree_title">Titolo Accademico Completo</Label>
            <Input
              id="degree_title"
              value={formData.degree_title}
              onChange={(e) => setFormData({ ...formData, degree_title: e.target.value })}
              placeholder="es. Laurea Magistrale in Ingegneria Informatica"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Lingue (separate da virgola)</Label>
            <Input
              id="languages"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              placeholder="es. Italiano, Inglese, Spagnolo"
            />
          </div>

          {profile.role === 'candidate' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="availability">Disponibilità</Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="es. Immediata, 1 mese"
                  />
                </div>
              </div>
            </>
          )}

          {profile.role === 'recruiter' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_size">Dimensione Azienda</Label>
                  <Select
                    value={formData.company_size}
                    onValueChange={(value) => setFormData({ ...formData, company_size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona dimensione" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="1-10">1-10 dipendenti</SelectItem>
                      <SelectItem value="11-50">11-50 dipendenti</SelectItem>
                      <SelectItem value="51-200">51-200 dipendenti</SelectItem>
                      <SelectItem value="201-500">201-500 dipendenti</SelectItem>
                      <SelectItem value="501-1000">501-1000 dipendenti</SelectItem>
                      <SelectItem value="1001+">1001+ dipendenti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Settore / Industria</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="es. Tech, Finance, Healthcare"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
