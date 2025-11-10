import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Mail, Sparkles, Plus, Check, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CandidateDetailDialogProps {
  candidate: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const CandidateDetailDialog = ({ candidate, open, onOpenChange, onUpdate }: CandidateDetailDialogProps) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && candidate) {
      loadCandidateDetails();
    }
  }, [open, candidate]);

  const loadCandidateDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load notes
      const { data: notesData } = await supabase
        .from('candidate_notes')
        .select('*')
        .eq('candidate_id', candidate.id)
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      if (notesData) setNotes(notesData);

      // Load tags
      const { data: tagsData } = await supabase
        .from('candidate_tags')
        .select('*')
        .eq('candidate_id', candidate.id);

      if (tagsData) setTags(tagsData.map(t => t.tag_name));

      // Load tasks
      const { data: tasksData } = await supabase
        .from('candidate_tasks')
        .select('*')
        .eq('candidate_id', candidate.id)
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      if (tasksData) setTasks(tasksData);

      // Load interactions
      const { data: interactionsData } = await supabase
        .from('interactions')
        .select('*')
        .eq('candidate_id', candidate.id)
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (interactionsData) setInteractions(interactionsData);
    } catch (error) {
      console.error('Error loading candidate details:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('candidate_notes').insert({
        candidate_id: candidate.id,
        recruiter_id: user.id,
        content: newNote
      });

      if (error) throw error;

      await supabase.from('interactions').insert({
        candidate_id: candidate.id,
        recruiter_id: user.id,
        type: 'note',
        content: newNote
      });

      toast.success("Nota aggiunta");
      setNewNote("");
      loadCandidateDetails();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error("Errore nell'aggiungere la nota");
    }
  };

  const addTag = async () => {
    if (!newTag.trim() || tags.includes(newTag)) return;

    try {
      const { error } = await supabase.from('candidate_tags').insert({
        candidate_id: candidate.id,
        tag_name: newTag
      });

      if (error) throw error;

      toast.success("Tag aggiunto");
      setNewTag("");
      loadCandidateDetails();
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error("Errore nell'aggiungere il tag");
    }
  };

  const toggleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('candidate_tasks')
        .update({ completed: !completed })
        .eq('id', taskId);

      if (error) throw error;
      loadCandidateDetails();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const generateAIFollowup = async () => {
    setLoading(true);
    try {
      const context = notes.length > 0 ? notes[0].content : "";
      
      const { data, error } = await supabase.functions.invoke('ai-followup', {
        body: {
          candidateName: candidate.full_name,
          tone,
          context
        }
      });

      if (error) throw error;

      setAiMessage(data.message);
      toast.success("Messaggio generato con AI");
    } catch (error) {
      console.error('Error generating AI message:', error);
      toast.error("Errore nella generazione del messaggio");
    } finally {
      setLoading(false);
    }
  };

  const sendFollowup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('interactions').insert({
        candidate_id: candidate.id,
        recruiter_id: user.id,
        type: 'message',
        content: aiMessage
      });

      // Here you could integrate with Resend to send actual email
      toast.success("Follow-up inviato");
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending followup:', error);
      toast.error("Errore nell'invio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{candidate.full_name}</DialogTitle>
            <Button
              variant={candidate.is_favorite ? "default" : "outline"}
              size="icon"
            >
              <Star className={candidate.is_favorite ? "fill-current" : ""} />
            </Button>
          </div>
          <p className="text-muted-foreground">{candidate.job_title}</p>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="notes">Note & Task</TabsTrigger>
            <TabsTrigger value="ai">AI Follow-up</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informazioni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.bio && (
                  <div className="pb-4 border-b">
                    <p className="text-sm font-medium mb-2">Bio / Esperienze</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{candidate.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Città</p>
                    <p className="font-medium">{candidate.city || "Non specificato"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ultimo contatto</p>
                    <p className="font-medium">
                      {candidate.last_contact_date 
                        ? new Date(candidate.last_contact_date).toLocaleDateString()
                        : "Mai"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Score</p>
                    <p className="font-medium">{candidate.engagement_score || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Disponibilità</p>
                    <p className="font-medium">{candidate.availability || "Non specificata"}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills?.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Tag</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nuovo tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aggiungi Nota</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Scrivi una nota su questo candidato..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={addNote}>Salva Nota</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Note Salvate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {notes.map(note => (
                  <div key={note.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task & Reminder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleTaskComplete(task.id, task.completed)}
                    >
                      {task.completed ? <Check className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4" />}
                    </Button>
                    <div className="flex-1">
                      <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Genera Messaggio AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tono del messaggio</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Amichevole</SelectItem>
                      <SelectItem value="professional">Professionale</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={generateAIFollowup} disabled={loading} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {loading ? "Generazione..." : "Genera Messaggio"}
                </Button>

                {aiMessage && (
                  <div className="space-y-2">
                    <Textarea
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      rows={6}
                      className="font-sans"
                    />
                    <div className="flex gap-2">
                      <Button onClick={sendFollowup} className="flex-1">
                        <Mail className="mr-2 h-4 w-4" />
                        Invia Follow-up
                      </Button>
                      <Button variant="outline" onClick={() => setAiMessage("")}>
                        Cancella
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cronologia Attività</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interactions.map(interaction => (
                    <div key={interaction.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{interaction.type}</p>
                        <p className="text-sm text-muted-foreground">{interaction.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(interaction.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailDialog;
