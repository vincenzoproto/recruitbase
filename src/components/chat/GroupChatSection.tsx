import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Users, Plus, MessageCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const GroupChatSection = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [memberFilter, setMemberFilter] = useState("");

  useEffect(() => {
    loadGroups();
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupMessages();
      
      // Real-time subscription
      const channel = supabase
        .channel(`group-messages-${selectedGroup.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'group_messages',
            filter: `group_id=eq.${selectedGroup.id}`
          },
          (payload) => {
            setGroupMessages(prev => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    const { data } = await supabase
      .from('chat_groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setGroups(data);
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .order('full_name');
    
    if (data) setUsers(data);
  };

  const loadGroupMessages = async () => {
    if (!selectedGroup) return;

    const { data } = await supabase
      .from('group_messages')
      .select(`
        *,
        sender:profiles!group_messages_sender_id_fkey(full_name, avatar_url)
      `)
      .eq('group_id', selectedGroup.id)
      .order('created_at', { ascending: true });
    
    if (data) setGroupMessages(data);
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast.error("Inserisci nome gruppo e seleziona almeno un membro");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: group, error } = await supabase
        .from('chat_groups')
        .insert({
          name: groupName,
          description: groupDescription,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add members
      const members = [user.id, ...selectedUsers].map(userId => ({
        group_id: group.id,
        user_id: userId
      }));

      await supabase.from('chat_group_members').insert(members);

      toast.success("Gruppo creato!");
      setCreateOpen(false);
      setGroupName("");
      setGroupDescription("");
      setSelectedUsers([]);
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error("Errore nella creazione del gruppo");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: selectedGroup.id,
          sender_id: user.id,
          content: newMessage,
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Errore nell'invio del messaggio");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Gruppi Chat
        </h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crea Gruppo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea Nuovo Gruppo</DialogTitle>
              <DialogDescription>
                Crea un gruppo per comunicare con più persone
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Gruppo</Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="es. Team Marketing"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrizione (opzionale)</Label>
                <Textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Descrivi lo scopo del gruppo..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Membri</Label>
                <Input
                  placeholder="Cerca membri..."
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                  className="mb-2"
                />
                <ScrollArea className="h-48 border rounded-md p-4">
                  {users
                    .filter(user => 
                      user.full_name.toLowerCase().includes(memberFilter.toLowerCase()) ||
                      user.role.toLowerCase().includes(memberFilter.toLowerCase())
                    )
                    .map(user => (
                      <div key={user.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <label className="text-sm cursor-pointer">
                          {user.full_name} <Badge variant="outline">{user.role}</Badge>
                        </label>
                      </div>
                    ))}
                </ScrollArea>
              </div>
              <Button onClick={createGroup} className="w-full">
                Crea Gruppo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-2">
          {groups.map(group => (
            <Card
              key={group.id}
              className={`cursor-pointer transition-colors ${
                selectedGroup?.id === group.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedGroup(group)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {group.name}
                </CardTitle>
                {group.description && (
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                )}
              </CardHeader>
            </Card>
          ))}
          {groups.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nessun gruppo. Creane uno!
            </p>
          )}
        </div>

        <Card className="md:col-span-2">
          {selectedGroup ? (
            <>
              <CardHeader>
                <CardTitle>{selectedGroup.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-96 border rounded-lg p-4">
                  {groupMessages.map(msg => (
                    <div key={msg.id} className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {msg.sender?.full_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm bg-muted p-2 rounded-lg">{msg.content}</p>
                    </div>
                  ))}
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage}>Invia</Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full min-h-[400px]">
              <p className="text-muted-foreground">Seleziona un gruppo per vedere i messaggi</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};
