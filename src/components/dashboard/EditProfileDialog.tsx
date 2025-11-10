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
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { CoreValuesSelector } from "@/components/ui/core-values-selector";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  onSuccess: () => void;
}

const EditProfileDialog = ({ open, onOpenChange, profile, onSuccess }: EditProfileDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    city: profile.city || "",
    job_title: profile.job_title || "",
    bio: profile.bio || "",
    skills: profile.skills?.join(", ") || "",
    linkedin_url: profile.linkedin_url || "",
    phone_number: profile.phone_number || "",
    years_experience: profile.years_experience || "",
    education: profile.education || "",
    languages: profile.languages?.join(", ") || "",
    availability: profile.availability || "",
    work_preference: profile.work_preference || "",
    expected_salary: profile.expected_salary || "",
    company_size: profile.company_size || "",
    industry: profile.industry || "",
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
          core_values: coreValues,
          years_experience: formData.years_experience || null,
          education: formData.education || null,
          languages: languagesArray.length > 0 ? languagesArray : null,
          availability: formData.availability || null,
          work_preference: formData.work_preference || null,
          expected_salary: formData.expected_salary || null,
          company_size: formData.company_size || null,
          industry: formData.industry || null,
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
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                placeholder="es. 5 anni"
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

                <div className="space-y-2">
                  <Label htmlFor="work_preference">Preferenza Lavoro</Label>
                  <Input
                    id="work_preference"
                    value={formData.work_preference}
                    onChange={(e) => setFormData({ ...formData, work_preference: e.target.value })}
                    placeholder="es. Remote, Ibrido, In sede"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_salary">Retribuzione Attesa (RAL annua)</Label>
                <Input
                  id="expected_salary"
                  value={formData.expected_salary}
                  onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })}
                  placeholder="es. 35.000 - 45.000 €"
                />
              </div>
            </>
          )}

          {profile.role === 'recruiter' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_size">Dimensione Azienda</Label>
                  <Input
                    id="company_size"
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    placeholder="es. 50-100 dipendenti"
                  />
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
