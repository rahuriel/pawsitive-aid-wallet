
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TreatmentRequest, TreatmentCategory } from "@/types/treatment";
import { Separator } from "@/components/ui/separator";

interface TreatmentRequestCardProps {
  request: TreatmentRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
}

const TreatmentRequestCard = ({ request, onApprove, onReject }: TreatmentRequestCardProps) => {
  const { user } = useAuth();
  const isModerator = user?.role === "moderator";
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const handleReject = () => {
    if (onReject && rejectionReason.trim()) {
      onReject(request.id, rejectionReason);
      setRejectDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        {request.image_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <img 
              src={request.image_url} 
              alt={`${request.animal_type} - ${request.animal_name || 'unnamed'}`}
              className="w-full h-full object-cover"
            />
            <Badge className={`absolute top-2 right-2 ${statusColors[request.status]}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
        )}
        
        {!request.image_url && (
          <div className="h-12 flex items-center px-4">
            <Badge className={statusColors[request.status]}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {request.animal_name ? `${request.animal_name} (${request.animal_type})` : request.animal_type}
              </CardTitle>
              <CardDescription>Requested by Dr. {request.vet_name}</CardDescription>
            </div>
            <div className="text-lg font-bold text-pawsitive-primary">
              ${request.amount.toFixed(2)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm line-clamp-3">{request.description}</p>
          
          {/* Display treatment categories if available */}
          {request.categories && request.categories.length > 0 && (
            <div className="mt-3">
              <Separator className="my-2" />
              <p className="text-xs font-medium mb-1">Treatment Categories:</p>
              <div className="flex flex-wrap gap-1">
                {request.categories.map(category => (
                  <Badge key={category.id} variant="outline" className="bg-pawsitive-primary/10 text-xs">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            Submitted on {formatDate(request.created_at)}
          </p>
          {request.status === "rejected" && request.rejection_reason && (
            <div className="mt-2 p-2 bg-red-50 rounded-md">
              <p className="text-xs font-semibold text-red-700">Rejection reason:</p>
              <p className="text-xs text-red-600">{request.rejection_reason}</p>
            </div>
          )}
        </CardContent>
        
        {isModerator && request.status === "pending" && (
          <CardFooter className="flex gap-2 pt-0">
            <Button 
              onClick={() => onApprove && onApprove(request.id)} 
              variant="default" 
              size="sm" 
              className="w-full"
            >
              Approve
            </Button>
            <Button 
              onClick={() => setRejectDialogOpen(true)} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Reject
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Treatment Request</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectionReason">Reason for rejection</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this request"
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              variant="destructive"
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TreatmentRequestCard;
