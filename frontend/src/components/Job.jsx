import { Bookmark } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'

import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '../../utils/constant'
import { setUser } from '../../redux/authSlice'
import { toast } from 'sonner'

const Job = ({job}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user && user.profile && user.profile.savedJobs) {
      setIsSaved(user.profile.savedJobs.includes(job?._id));
    }
  }, [user, job?._id]);

  const handleSaveJob = async () => {
    if (!user) {
      toast.error("Please log in to save jobs");
      return navigate("/login");
    }
    try {
      const res = await axios.post(`${USER_API_END_POINT}/profile/save-job/${job._id}`, {}, {
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error saving job");
    }
  }

  // const jobId = "12dfgfdbfgghnhnfnhg"
const daysAgoFunction = (mongodbTime) =>{
  const createdAt = new Date(mongodbTime);
  const currentTime = new Date();
  const timeDiffernce = currentTime - createdAt;
  return Math.floor(timeDiffernce/(1000*24*60*60));
}
  
  return (
    <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100'>
        <div className='flex items-center justify-between'> 
     <p className='text-sm text-gray-600' >{daysAgoFunction(job?.createdAt) === 0 ? "Today": `${daysAgoFunction(job?.createdAt)}`} days ago</p>
     <Button onClick={handleSaveJob} variant="outline" className={`rounded-full ${isSaved ? 'bg-purple-100 text-purple-600 border-purple-600' : ''}`} size="icon"><Bookmark className={isSaved ? "fill-purple-600" : ""} /></Button>
     </div>
     <div className='flex items-center gap-2 my-2'>
        <Button className="p-6" variant="outline" size="icon">
            <Avatar>
                <AvatarImage src={job?.company?.logo}/>
            </Avatar>
        </Button>
        <div>
            <h1>{job?.company?.name}</h1>
            <p>{job?.location}</p>
        </div>
     </div>

     <div>
        <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
        <p className='text-sm text-gray-600'>{job?.description}</p>
     </div>
     <div className='flex items-center gap-2 mt-4'>
        <Badge className={"text-blue-700 font-bold"} variant="ghost">{job?.position} Positions</Badge>
        <Badge className={"text-red-700 font-bold"} variant="ghost">{job?.jobType}</Badge>
        <Badge className={"text-purple-600 font-bold"} variant="ghost">{job?.salary}LPA</Badge>
      </div>
      <div className='flex items-center gap-4 mt-4'>
        <Button variant="outline" onClick={()=>navigate(`/description/${job?._id}`)} >Details</Button>
        <Button onClick={handleSaveJob} className={isSaved ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}>{isSaved ? "Unsave" : "Save For Later"}</Button>
      </div>
    </div>
  )
}

export default Job
