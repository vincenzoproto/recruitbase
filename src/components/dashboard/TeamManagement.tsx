import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Crown, User, Mail } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Recruiter";
  avatar?: string;
  assignedCandidates: number;
}

interface TeamManagementProps {
  userId: string;
}

export const TeamManagement = ({ userId }: TeamManagementProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "Recruiter" as TeamMember["role"],
  });

  useEffect(() => {
    loadTeamMembers();
  }, [userId]);

  const loadTeamMembers = () => {
    // Mock team data
    const mockMembers: TeamMember[] = [
      {
        id: "1",
        name: "Luca Verdi",
        email: "luca.verdi@company.com",
        role: "Admin",
        assignedCandidates: 15,
      },
      {
        id: "2",
        name: "Giulia Neri",
        email: "giulia.neri@company.com",
        role: "Recruiter",
        assignedCandidates: 8,
      },
    ];
    setMembers(mockMembers);
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    const member: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      assignedCandidates: 0,
    };

    setMembers([...members, member]);
    setShowAddDialog(false);
    setNewMember({ name: "", email: "", role: "Recruiter" });
    toast.success("Membro del team aggiunto!");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestione Team</h2>
          <p className="text-sm text-muted-foreground">
            Aggiungi membri e assegna candidati
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Aggiungi Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi Membro al Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Es. Mario Rossi"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="mario.rossi@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Ruolo</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(v: any) => setNewMember({ ...newMember, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recruiter">Recruiter</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddMember} className="w-full">
                Aggiungi al Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Membri del Team ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} alt={member.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{member.name}</span>
                        {member.role === "Admin" && (
                          <Badge variant="default" className="gap-1">
                            <Crown className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{member.assignedCandidates}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">candidati assegnati</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
