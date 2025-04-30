
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-pawsitive-dark">About PAWsitive Aid</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>Providing care for animals in need</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                PAWsitive Aid was founded in 2023 with a simple but powerful mission: to ensure that no animal goes without 
                necessary medical care due to financial constraints. We believe that every animal deserves access to quality 
                veterinary care regardless of their owner's financial situation or if they have no owner at all.
              </p>
              <p>
                Through our community-driven platform, we connect generous donors with verified veterinarians to fund 
                essential treatments for animals in need. Our transparent approval process ensures that funds are 
                allocated effectively and ethically.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Our three-step process</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-4">
                <li>
                  <strong>Donations:</strong> Animal lovers from around the world contribute to our community fund. 
                  100% of donations go directly to animal care, with operational costs covered by separate partnerships.
                </li>
                <li>
                  <strong>Veterinarian Requests:</strong> Verified veterinarians submit treatment requests for animals 
                  that need financial assistance, including details about the animal's condition and estimated costs.
                </li>
                <li>
                  <strong>Community Approval:</strong> Our team of volunteer moderators reviews each request to ensure 
                  it meets our guidelines for funding. Once approved, the funds are released directly to the veterinarian.
                </li>
              </ol>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Our Team</CardTitle>
              <CardDescription>The people behind PAWsitive Aid</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                PAWsitive Aid is run by a dedicated team of animal welfare professionals, veterinarians, and 
                technology experts. Our volunteer moderators come from diverse backgrounds but share a common 
                passion for animal welfare.
              </p>
              <p>
                We're always looking for volunteers to join our cause. If you're interested in becoming a 
                moderator or helping in other ways, please reach out through our Contact page.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="bg-pawsitive-dark text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="ml-2 font-bold text-lg">PAWsitive Aid</span>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} PAWsitive Aid. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
