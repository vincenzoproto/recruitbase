import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Bell, BriefcaseIcon, MessageSquare, Users, TrendingUp, CheckCircle2, Clock } from "lucide-react";

const Notifications = () => {
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    loadUser();
  }, []);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    getTimeAgo
  } = useNotifications(userId);

  if (!userId) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'new_application':
        return <BriefcaseIcon className="h-5 w-5 text-green-500" />;
      case 'match':
      case 'match_found':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'profile_view':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'meeting_request':
      case 'meeting_confirmed':
        return <Clock className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationsByCategory = (category: string) => {
    switch (category) {
      case 'all':
        return notifications;
      case 'messages':
        return notifications.filter(n => n.type === 'new_message');
      case 'applications':
        return notifications.filter(n => ['new_application', 'application_status'].includes(n.type));
      case 'matches':
        return notifications.filter(n => ['match', 'match_found'].includes(n.type));
      case 'system':
        return notifications.filter(n => ['profile_view', 'meeting_request', 'meeting_confirmed'].includes(n.type));
      default:
        return [];
    }
  };

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);
    
    switch (notification.type) {
      case 'new_message':
        navigate('/messages');
        break;
      case 'new_application':
        navigate('/applications');
        break;
      case 'match':
      case 'match_found':
        navigate('/matches');
        break;
      case 'meeting_request':
      case 'meeting_confirmed':
        navigate('/calendar');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const renderNotificationList = (notificationsList: any[]) => {
    if (loading) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Caricamento...
        </div>
      );
    }

    if (notificationsList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Nessuna notifica
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {notificationsList.map((notification) => (
          <Card 
            key={notification.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              !notification.read ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    {!notification.read && (
                      <Badge variant="default" className="flex-shrink-0">Nuovo</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {getTimeAgo(notification.created_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifiche</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground mt-1">
                {unreadCount} notifiche non lette
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Segna tutte come lette
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              Tutte
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messaggi
            </TabsTrigger>
            <TabsTrigger value="applications">
              <BriefcaseIcon className="h-4 w-4 mr-2" />
              Candidature
            </TabsTrigger>
            <TabsTrigger value="matches">
              <Users className="h-4 w-4 mr-2" />
              Match
            </TabsTrigger>
            <TabsTrigger value="system">
              <Bell className="h-4 w-4 mr-2" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {renderNotificationList(getNotificationsByCategory('all'))}
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            {renderNotificationList(getNotificationsByCategory('messages'))}
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            {renderNotificationList(getNotificationsByCategory('applications'))}
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            {renderNotificationList(getNotificationsByCategory('matches'))}
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            {renderNotificationList(getNotificationsByCategory('system'))}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Notifications;
