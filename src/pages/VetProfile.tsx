
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VetVerification from "@/components/VetVerification";

const VetProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto mt-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You need to log in to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user.role !== "vet") {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto mt-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This page is only accessible to veterinarians.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="container mx-auto mt-8 px-4 pb-10">
        <h1 className="text-2xl font-bold mb-6">Veterinarian Profile</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_vet_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_vet_verified ? 'Verified' : 'Unverified'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <VetVerification />
        </div>
      </div>
    </div>
  );
};

export default VetProfile;
