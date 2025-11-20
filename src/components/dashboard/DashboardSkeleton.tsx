import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 shimmer" />
            <Skeleton className="h-4 w-36 shimmer" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full shimmer" />
            <Skeleton className="h-10 w-10 rounded-full shimmer" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        {/* Profile Completion Banner */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48 shimmer" />
                <Skeleton className="h-4 w-64 shimmer" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xl shimmer" />
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-10 rounded-xl shimmer" />
                  <Skeleton className="h-6 w-16 shimmer" />
                </div>
                <Skeleton className="h-8 w-24 shimmer" />
                <Skeleton className="h-4 w-32 shimmer" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-12 w-12 rounded-xl shimmer mx-auto" />
                <Skeleton className="h-4 w-24 shimmer mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48 shimmer" />
              <Skeleton className="h-10 w-32 rounded-xl shimmer" />
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-xl">
                <Skeleton className="h-12 w-12 rounded-full shimmer" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 shimmer" />
                  <Skeleton className="h-4 w-64 shimmer" />
                </div>
                <Skeleton className="h-9 w-24 rounded-lg shimmer" />
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DashboardSkeleton;
