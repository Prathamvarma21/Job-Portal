import { useMemo, useState } from "react";
import { CalendarClock, MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useSelector, useDispatch } from "react-redux";
import { setActiveChatUser } from "../../../redux/chatSlice";
import { updateApplicantStatus } from "../../../redux/applicationSlice";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import axios from "axios";
import { Application_API_END_POINT, USER_API_END_POINT } from "../../../utils/constant.js";

const shortListingStatus = ["Accepted","Rejected"]

const formatGoogleDate = (date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const getDefaultInterviewTime = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const buildGoogleCalendarUrl = ({ applicant, recruiter, job, interviewAt, duration }) => {
    const start = new Date(interviewAt);
    const end = new Date(start.getTime() + Number(duration) * 60000);
    const title = `Interview: ${job?.title || "Job Application"} with ${applicant?.fullName || "Candidate"}`;
    const details = [
        `Candidate: ${applicant?.fullName || "Candidate"}`,
        `Candidate email: ${applicant?.email || "Not available"}`,
        `Recruiter: ${recruiter?.fullName || "Recruiter"}`,
        "",
        "Before saving the event, click Add Google Meet video conferencing in Google Calendar.",
    ].join("\n");

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
        details,
        location: "Google Meet",
        add: [applicant?.email, recruiter?.email].filter(Boolean).join(","),
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

function ApplicantsTable(){
    const {applicants} = useSelector(store=>store.application);
    const {user} = useSelector(store=>store.auth);
    const dispatch = useDispatch();
    const [bookingApplicant, setBookingApplicant] = useState(null);
    const [interviewAt, setInterviewAt] = useState(getDefaultInterviewTime());
    const [duration, setDuration] = useState("30");
    const [calendarUrl, setCalendarUrl] = useState("");

    const selectedApplicant = bookingApplicant?.applicant;
    const selectedJob = applicants;

    const previewCalendarUrl = useMemo(() => {
        if (!bookingApplicant || !interviewAt) return "";
        return buildGoogleCalendarUrl({
            applicant: selectedApplicant,
            recruiter: user,
            job: selectedJob,
            interviewAt,
            duration,
        });
    }, [bookingApplicant, duration, interviewAt, selectedApplicant, selectedJob, user]);

    const statusHandler = async(status,id)=>{
try{
    axios.defaults.withCredentials=true;
const res = await axios.post(`${Application_API_END_POINT}/status/${id}/update`,{status});
console.log(res)
if(res.data.success){
    dispatch(updateApplicantStatus({applicationId:id,status:status.toLowerCase()}));
    toast.success(res.data.message)
    return true;
}
}catch(error){
    toast.error(error.response.data.message)
}
return false;
    }

    const openBookingDialog = (item) => {
        setBookingApplicant(item);
        setInterviewAt(getDefaultInterviewTime());
        setDuration("30");
        setCalendarUrl("");
    };

    const sendInterviewMessage = async (inviteUrl) => {
        const messageApiUrl = USER_API_END_POINT.replace("/api/v1/user", "/api/v1/message");
        const message = [
            `Your application for ${selectedJob?.title || "the role"} has been accepted.`,
            `Interview time: ${new Date(interviewAt).toLocaleString()}.`,
            `Google Calendar invite: ${inviteUrl}`,
        ].join("\n");

        await axios.post(
            `${messageApiUrl}/send/${selectedApplicant?._id}`,
            { message },
            { withCredentials: true }
        );
    };

    const confirmInterview = async () => {
        if(!bookingApplicant || !interviewAt){
            toast.error("Please select an interview date and time");
            return;
        }

        const updated = await statusHandler("Accepted", bookingApplicant._id);
        if(!updated) return;

        setCalendarUrl(previewCalendarUrl);
        try{
            await sendInterviewMessage(previewCalendarUrl);
            toast.success("Invite link sent in chat");
        }catch(error){
            console.log(error);
            toast.error("Calendar opened, but chat invite could not be sent");
        }
        window.open(previewCalendarUrl, "_blank", "noopener,noreferrer");
        toast.success("Google Calendar invite opened");
    };

    const mailInvite = () => {
        if(!calendarUrl) return;
        const subject = encodeURIComponent(`Interview invite: ${selectedJob?.title || "Job Application"}`);
        const body = encodeURIComponent(
            `Hi ${selectedApplicant?.fullName || "there"},\n\nYour application has been accepted. Please use this Google Calendar invite link to confirm the interview:\n\n${calendarUrl}\n\nGoogle Calendar will include the applicant and recruiter as attendees. The recruiter can add Google Meet conferencing before saving the event.\n\nThanks,\n${user?.fullName || "Recruiter"}`
        );
        const recipients = [selectedApplicant?.email, user?.email].filter(Boolean).join(",");
        window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
    };

    return(
<div>
    <Table>
        <TableCaption>A list of your recent applied user</TableCaption>
        <TableHeader>
            <TableRow>
                <TableHead>FullName</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
                {
                    applicants && applicants?.applications?.map((item)=>(
<tr key={item._id}>
                    <TableCell>{item?.applicant?.fullName}</TableCell>
                    <TableCell>{item?.applicant?.email}</TableCell>
                    <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                    <TableCell className="text-blue-600">
                        {
                           item.applicant?.profile?.resume ?  <a className="text-blue-600 cursor-pointer"
                           href={item?.applicant?.profile?.resume} target="_blank" rel="noopener norefrence"> {item?.applicant?.profile?.resumeOriginalName}</a>:<span>NA</span>
                        }
                       </TableCell>
                    <TableCell>{item?.applicant.createdAt.split("T")[0]}</TableCell>
                    <TableCell className="float-right cursor-pointer flex items-center gap-3">
                        <Button onClick={() => dispatch(setActiveChatUser(item.applicant))} variant="ghost" size="icon" className="h-8 w-8 text-indigo-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                        </Button>
                        <Popover>
                            <PopoverTrigger>
                                <MoreHorizontal/>
                            </PopoverTrigger>
                        <PopoverContent className="w-32">
                        {
                            shortListingStatus.map((status,index)=>{
                                return(
                                    <div
                                    onClick={()=> status === "Accepted" ? openBookingDialog(item) : statusHandler(status,item._id)}
                                    key={index}
                                    className="flex w-fit items-center my-2 cursor-pointer">
                                        <span>{status}</span>
                                    </div>
                                )
                            })
                        }
                        </PopoverContent>
                        </Popover>
                    </TableCell>
                </tr>
                    ))
                }
                
            </TableBody>
        
    </Table>
    <Dialog open={!!bookingApplicant} onOpenChange={(open) => !open && setBookingApplicant(null)}>
        <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
                <DialogTitle>Book interview</DialogTitle>
                <DialogDescription>
                    Choose a time, open Google Calendar, add Meet conferencing, then send the invite.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
                <div className="rounded-lg border p-4 bg-slate-50">
                    <p className="font-medium text-gray-950">{selectedApplicant?.fullName}</p>
                    <p className="text-sm text-gray-600">{selectedApplicant?.email}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedJob?.title || "Selected role"}</p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="interviewAt">Date and time</Label>
                    <Input
                    id="interviewAt"
                    type="datetime-local"
                    value={interviewAt}
                    onChange={(e)=>setInterviewAt(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="duration">Duration</Label>
                    <select
                    id="duration"
                    value={duration}
                    onChange={(e)=>setDuration(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                    </select>
                </div>
                {calendarUrl && (
                    <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950">
                        Interview accepted. Google Calendar is ready for Meet conferencing and attendee invites.
                    </div>
                )}
            </div>
            <DialogFooter className="gap-2">
                {calendarUrl ? (
                    <>
                        <Button type="button" variant="outline" onClick={() => window.open(calendarUrl, "_blank", "noopener,noreferrer")}>
                            <CalendarClock className="w-4 h-4 mr-2" />
                            Open Calendar
                        </Button>
                        <Button type="button" onClick={mailInvite}>Email invite link</Button>
                    </>
                ) : (
                    <Button type="button" onClick={confirmInterview}>
                        <CalendarClock className="w-4 h-4 mr-2" />
                        Accept and create invite
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
    </Dialog>
</div>
    )
}
export default ApplicantsTable;
