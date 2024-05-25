import login_image from "../assets/login_image.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "../components/ui/input";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { backendURL } from "../appConfig";
import { jwtDecode } from "jwt-decode";

interface iLoginRes {
  token: string;
  username: string;
}

interface TokenPayload {
  userId: string; // Assuming the payload contains a userId field
  // Include other fields as needed
}

interface iUserData {
  id: string | undefined;
  username: string ;
}

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, setToken, setUser } = useAuth();

  const decodeToken = (token: string | null): string | undefined => {
    try {
      // Decode the token and assert the type of the payload
      if (!token) {
        return undefined;
      }
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.userId;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return undefined;
    }
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log({ email, password });

    //TODO: fetch call to login API
    try {
      setLoading(true);
      // const formData = new FormData();
      // formData.append("email", email);
      // formData.append("password", password);
      const data = await fetch(`${backendURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the content type to application/json
        },
        body: JSON.stringify({ email: email, password: password }),
      });
      if (data.status === 200) {
        const { token, username }: iLoginRes = await data.json();
        setLoading(false);
        setIsAuthenticated(true);
        setToken(token);
        const userData : iUserData = { username: username, id: decodeToken(token) };
        setUser(userData);
        localStorage.setItem("token", JSON.stringify(token));
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/home");
      } else {
        setError("Invalid username/password.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isAuthenticated) {
    navigate("/home");
  }

  return (
    <div className="lg:flex lg:justify-center lg:items-center h-full">
      <img className="lg:w-1/3" src={login_image}></img>
      <div>
        <form onSubmit={submitForm}>
          <Card className="mx-auto max-w-sm border-none shadow-none">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold ">Welcome </CardTitle>
              <CardDescription>Enter your email and password to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && <div className="text-red-600">{error}</div>}
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
                  Login
                  <ChevronRight />
                </Button>
              </div>
              <Separator className="my-4" />
              <div className="text-center">
                <span className="">Don't have an account ?</span>
                <span className="underline underline-offset-4">
                  {" "}
                  <Link to="/signup">Sign Up</Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
