import Signin from "@/components/Signin";
import Signup from "@/components/Signup";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LandingPage = () => {
  return (
    <main className="w-full h-full">
      {/* Navbar */}

      <div className="hero_section w-full lg:h-screen h-full flex flex-col md:flex-row">
        <div className="left flex-1 bg-blue-50 flex justify-start lg:items-center px-4 md:px-16">
          <div className="flex flex-col">
            <h1 className="text-[40px] font-bold leading-tight mt-6 lg:mt-0">
              Simplify <br /> Summarizing with AI <br /> Technology
            </h1>
            <p className="text-[13px] mt-2">
              Our AI-powered tool extracts key information from documents and{" "}
              <br /> articles, saving you time and effort.
            </p>
            <div className="flex mt-4 gap-4 pb-2">
              <Button variant="ghost" className="bg-black text-white hover">
                Learn More
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Sign up</Button>
                </DialogTrigger>
                <DialogContent className="h-[550px] overflow-hidden bg-transparent border-none">
                  <Tabs defaultValue="account" className="w-[350px] mx-auto">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                      <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sign-in">
                      <Signin />
                    </TabsContent>
                    <TabsContent value="sign-up">
                      <Signup />
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        <div className="right hidden md:hidden lg:block w-full lg:w-1/2 bg-blue-50">
          bvcbvc
        </div>
      </div>
    </main>
  );
};

export default LandingPage;
