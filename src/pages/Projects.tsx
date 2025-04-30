
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Projects = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-pawsitive-dark">Our Projects</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Response Unit</CardTitle>
              <CardDescription>Rapid care for injured strays</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Our Emergency Response Unit provides immediate care for stray animals found injured 
                on streets. Working with local volunteers, we ensure quick medical attention.
              </p>
              <p className="mb-4 font-semibold">Impact: 120+ animals treated in 2024</p>
              <Button className="w-full bg-pawsitive-primary hover:bg-pawsitive-secondary">Learn More</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rural Veterinary Outreach</CardTitle>
              <CardDescription>Bringing care to underserved areas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This project brings essential veterinary services to rural communities where 
                access to animal healthcare is limited or non-existent.
              </p>
              <p className="mb-4 font-semibold">Impact: 15 communities reached, 350+ animals treated</p>
              <Button className="w-full bg-pawsitive-primary hover:bg-pawsitive-secondary">Learn More</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Spay & Neuter Initiative</CardTitle>
              <CardDescription>Controlling stray populations humanely</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Our flagship program focuses on controlling stray animal populations through 
                free spay and neuter clinics in partnership with local shelters.
              </p>
              <p className="mb-4 font-semibold">Impact: 500+ procedures performed</p>
              <Button className="w-full bg-pawsitive-primary hover:bg-pawsitive-secondary">Learn More</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Veterinary Education Scholarships</CardTitle>
              <CardDescription>Training the next generation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We provide scholarships to promising students pursuing veterinary medicine 
                who commit to working in underserved communities after graduation.
              </p>
              <p className="mb-4 font-semibold">Impact: 8 scholarships awarded</p>
              <Button className="w-full bg-pawsitive-primary hover:bg-pawsitive-secondary">Learn More</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Wildlife Rescue Collaboration</CardTitle>
              <CardDescription>Supporting native species</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                In partnership with wildlife rehabilitation centers, we provide funding for 
                treatment of injured native wildlife species.
              </p>
              <p className="mb-4 font-semibold">Impact: 75+ wild animals treated and released</p>
              <Button className="w-full bg-pawsitive-primary hover:bg-pawsitive-secondary">Learn More</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Shelter Improvement Grants</CardTitle>
              <CardDescription>Upgrading animal housing facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We provide grants to animal shelters for facility improvements that enhance 
                animal welfare and health outcomes.
              </p>
              <p className="mb-4 font-semibold">Impact: 5 shelters upgraded, benefiting 200+ animals</p>
              <Button className="w-full bg-pawsitive-primary hover:bg-pawsitive-secondary">Learn More</Button>
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

export default Projects;
