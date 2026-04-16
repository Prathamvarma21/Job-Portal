import { useSelector, useDispatch } from "react-redux";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { setActiveChatUser } from "../../redux/chatSlice";



const AppliedJobTable =()=> {
    const {allAppliedJobs} = useSelector(store=>store.job);
    const dispatch = useDispatch();

return(
    <div>
       <Table>
        <TableCaption>A list of your applied jobs</TableCaption>
        <TableHeader>
            <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead classname="text-right">Status</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {
                allAppliedJobs.length <= 0 ?<span>You haven't applied any job yet</span>:allAppliedJobs.map((appliedJob)=>(
<TableRow key={appliedJob?._id}>
                    
                       <TableCell>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                       <TableCell>{appliedJob.job?.title}</TableCell>
                       <TableCell>{appliedJob.job?.company?.name}</TableCell>
                       <TableCell>
                           <Badge className={`${appliedJob?.status === "rejected" ? 'bg-red-400' :appliedJob.status === "pending" ? 'bg-gray-400' :'bg-green-400'}`}>{appliedJob.status.toUpperCase()}</Badge>
                           {appliedJob?.status === "accepted" && (
                               <Button 
                               onClick={() => dispatch(setActiveChatUser({ _id: appliedJob.job.company.userId, fullname: appliedJob.job.company.name }))} 
                               variant="ghost" 
                               size="icon" 
                               className="ml-4 h-8 w-8 text-indigo-600 rounded-full"
                               title="Message Recruiter">
                                   <MessageCircle className="w-5 h-5"/>
                               </Button>
                           )}
                       </TableCell>
                    </TableRow>
                )

            )
            }
           
        </TableBody>
       </Table>
    </div>
)
}

export default AppliedJobTable;