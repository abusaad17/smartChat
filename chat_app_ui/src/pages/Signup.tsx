import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ChevronRight } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { Link, useNavigate } from "react-router-dom";
import login_image from "../assets/login_image.svg";
import { useState } from "react";
import { backendURL } from "../appConfig";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const Signup = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ email, password, username });

    try {
      setLoading(true);
      // const formData = new FormData();
      // formData.append("email", email);
      // formData.append("password", password);
      // formData.append("username", username);
      const data = await fetch(`${backendURL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the content type to application/json
        },
        body: JSON.stringify({ email: email, password: password, username: username }),
      });
      if (data.status === 201) {
        toast("User Registered Successfully.");
        // setLoading(false);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast("Error in registering new user. Please try again later.");
        setError("Error in registering new user. Please try again later.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="lg:flex lg:justify-center lg:items-center h-full">
      <img className="lg:w-1/3" src={login_image}></img>
      <div className="lg:w-1/4">
        <form onSubmit={submitForm}>
          <Card className="mx-auto max-w-sm border-none shadow-none">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold ">Sign Up </CardTitle>
              <CardDescription>Hey there! Sign up to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && <div className="text-red-600">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Username"
                    required
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Email"
                    required
                    type="email"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Password"
                    required
                    type="password"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full gap-2" type="submit" disabled={loading}>
                  Create an account
                  <ChevronRight />
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="text-center">
                {/* <span className="">go back to</span> */}
                <span className="underline underline-offset-4">
                  {" "}
                  <Link to="/">Login</Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default Signup;
