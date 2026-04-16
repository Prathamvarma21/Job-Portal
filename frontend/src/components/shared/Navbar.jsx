import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, Menu, User2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { USER_API_END_POINT } from "../../../utils/constant.js";
import { setUser } from "../../../redux/authSlice.js";



const Navbar = () => {
  // let [user, setUser] = useState(false);
const {user}=useSelector(store=>store.auth);
const dispatch = useDispatch();
const navigate = useNavigate();
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

const navLinks = user && user.role === "recruiter"
  ? [
      { label: "Dashboard", to: "/admin/dashboard" },
      { label: "Companies", to: "/admin/companies" },
      { label: "Jobs", to: "/admin/jobs" },
    ]
  : [
      { label: "Home", to: "/" },
      { label: "Jobs", to: "/jobs" },
      { label: "Browse", to: "/Browse" },
    ];

 const logoutHandler = async()=>{
  try{
const res = await axios.get(`${USER_API_END_POINT}/logout`,{withCredentials:true});
if(res.data.success){
  localStorage.removeItem("token");
  dispatch(setUser(null));
  setMobileMenuOpen(false);
  navigate("/");
  toast.success(res.data.message)
}
  }catch(error){
    console.log(error);
    localStorage.removeItem("token");
    dispatch(setUser(null));
    setMobileMenuOpen(false);
    navigate("/");
    toast.error(error?.response?.data?.message || "Logged out locally")
    
  }
 }
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="flex items-center justify-between mx-auto max-w-6xl min-h-16 px-4 md:px-8">
        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold leading-none">
            Skill<span className="text-red-600">Hunt</span>
          </h1>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex font-medium items-center gap-5">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link className="text-gray-800 hover:text-red-600" to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
          {!user ? (
            <div className="flex items-center gap-2">
             <Link to="/login"> <Button variant="outline">Login</Button></Link>
             <Link to="/signup"><Button className="bg-purple-600 hover:bg-purple-700">
                Signup
              </Button></Link> 
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer h-9 w-9">
                  <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullName} />
                  <AvatarFallback className="bg-gray-200 text-gray-800 font-bold">
                    {user?.fullName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="flex gap-2 spae-y-2">
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullName} />
                    <AvatarFallback className="bg-gray-200 text-gray-800 font-bold">
                      {user?.fullName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{user?.fullName}</h4>
                    <p className="text-sm text-muted-foreground">
                     {user?.profile?.bio }
                    </p>
                  </div>
                </div>
                <div className="flex flex-col text-gray-600">
                  {
                    user && user.role === "student" && (
                      <div className="flex w-fit items-center gap-2 cursor-pointer">
                      <User2 />
                      <Button variant="link"><Link to="/profile">View Profile</Link></Button>
                    </div>
                    )
                  }
                 
                  <div className="flex w-fit items-center gap-2 cursor-pointer">
                    <LogOut />
                    <Button onClick={logoutHandler} variant="link">Logout</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-800"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 shadow-sm">
          <div className="mx-auto max-w-6xl pt-3">
            {user && (
              <div className="mb-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullName} />
                  <AvatarFallback className="bg-gray-200 text-gray-800 font-bold">
                    {user?.fullName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-950">{user?.fullName}</p>
                  <p className="text-sm capitalize text-gray-500">{user?.role}</p>
                </div>
              </div>
            )}
            <nav className="grid gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 font-medium text-gray-800 hover:bg-gray-50 hover:text-red-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 grid gap-2 border-t border-gray-100 pt-3">
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Signup</Button>
                  </Link>
                </>
              ) : (
                <>
                  {user.role === "student" && (
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <User2 className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </Link>
                  )}
                  <Button onClick={logoutHandler} variant="outline" className="w-full justify-start text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
