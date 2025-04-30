
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Activity {
  id: string;
  type: 'donation' | 'treatment' | 'approval';
  description: string;
  amount?: number;
  created_at: string;
  user_name?: string;
}

const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchActivities();
  }, []);
  
  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('treatment_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform treatment requests into activity format
      const formattedActivities: Activity[] = data.map((request: any) => ({
        id: request.id,
        type: request.status === 'approved' ? 'approval' : 'treatment',
        description: `${request.vet_name} requested treatment for ${request.animal_name || 'a ' + request.animal_type}`,
        amount: request.amount,
        created_at: request.created_at,
        user_name: request.vet_name
      }));
      
      // Add some simulated donation activities
      const donations: Activity[] = [
        {
          id: 'sim-1',
          type: 'donation',
          description: 'Donation to general fund',
          amount: 50,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          user_name: 'Anonymous Donor'
        }
      ];
      
      setActivities([...formattedActivities, ...donations].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all' && activity.type !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const description = activity.description.toLowerCase();
      const userName = (activity.user_name || '').toLowerCase();
      return description.includes(query) || userName.includes(query);
    }
    return true;
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getActivityTypeLabel = (type: string) => {
    switch(type) {
      case 'donation':
        return { label: 'Donation', color: 'bg-green-100 text-green-800' };
      case 'treatment':
        return { label: 'Treatment Request', color: 'bg-blue-100 text-blue-800' };
      case 'approval':
        return { label: 'Approval', color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: 'Activity', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>
              A comprehensive list of all donations and treatment requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="filter">Filter by type</Label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger id="filter" className="mt-1">
                    <SelectValue placeholder="Filter activities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="donation">Donations</SelectItem>
                    <SelectItem value="treatment">Treatment Requests</SelectItem>
                    <SelectItem value="approval">Approvals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">Loading activities...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => {
                    const type = getActivityTypeLabel(activity.type);
                    
                    return (
                      <TableRow key={activity.id}>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(activity.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge className={type.color}>
                            {type.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell>{activity.user_name || 'Unknown'}</TableCell>
                        <TableCell className="text-right">
                          {activity.amount ? `${activity.amount.toFixed(2)} TND` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {filteredActivities.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-gray-500">No activities found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ActivityList;
