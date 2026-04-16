import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "../shared/Navbar";
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs";
import SocialFeed from "../feed/SocialFeed";

const STATUS_COLORS = {
  accepted: "#0f766e",
  rejected: "#e11d48",
};

const BAR_COLORS = ["#2563eb", "#0f766e", "#f59e0b", "#e11d48", "#7c3aed"];

const formatMonth = (date) =>
  date.toLocaleString("default", { month: "long", year: "numeric" });

const isSameMonth = (date, compareDate) =>
  date.getMonth() === compareDate.getMonth() &&
  date.getFullYear() === compareDate.getFullYear();

const RecruiterDashboard = () => {
  useGetAllAdminJobs();
  const { allAdminJobs } = useSelector((store) => store.job);

  const analytics = useMemo(() => {
    const now = new Date();
    const applications = allAdminJobs.flatMap((job) =>
      (job?.applications || []).map((application) => ({
        ...application,
        jobTitle: job?.title || "Untitled role",
        companyName: job?.company?.name || "Company",
      }))
    );

    const applicationsThisMonth = applications.filter((application) =>
      isSameMonth(new Date(application.createdAt), now)
    );

    const statusCounts = applications.reduce(
      (counts, application) => {
        const status = application?.status?.toLowerCase();
        return {
          ...counts,
          [status]: (counts[status] || 0) + 1,
        };
      },
      { accepted: 0, rejected: 0, offered: 0, applied: 0 }
    );

    const statusData = ["accepted", "rejected"].map((status) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusCounts[status] || 0,
      fill: STATUS_COLORS[status],
    }));

    const topJobs = allAdminJobs
      .map((job) => ({
        name: job?.title || "Untitled role",
        company: job?.company?.name || "Company",
        applications: job?.applications?.length || 0,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);

    return {
      applications,
      applicationsThisMonth,
      statusCounts,
      statusData,
      topJobs,
      currentMonth: formatMonth(now),
    };
  }, [allAdminJobs]);

  const hasPerformanceData = analytics.topJobs.some((job) => job.applications > 0);
  const hasStatusData = analytics.statusData.some((item) => item.value > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-sm font-semibold text-teal-700">Recruiter analytics</p>
          <h1 className="text-3xl font-bold text-gray-950">Hiring dashboard</h1>
          <p className="text-gray-600">
            Track applications, compare job performance, and watch decisions move.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border rounded-lg p-5">
            <p className="text-sm text-gray-500">Applications in {analytics.currentMonth}</p>
            <p className="text-3xl font-bold text-gray-950 mt-2">
              {analytics.applicationsThisMonth.length}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-5">
            <p className="text-sm text-gray-500">Total applications</p>
            <p className="text-3xl font-bold text-gray-950 mt-2">
              {analytics.applications.length}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-5">
            <p className="text-sm text-gray-500">Accepted</p>
            <p className="text-3xl font-bold text-teal-700 mt-2">
              {analytics.statusCounts.accepted}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-5">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-3xl font-bold text-rose-600 mt-2">
              {analytics.statusCounts.rejected}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white border rounded-lg p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-950">Top performing jobs</h2>
              <p className="text-sm text-gray-500">Ranked by total applications received.</p>
            </div>
            {hasPerformanceData ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topJobs} margin={{ top: 10, right: 12, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`${value} applications`, "Total"]}
                      labelFormatter={(label) => {
                        const job = analytics.topJobs.find((item) => item.name === label);
                        return job ? `${job.name} at ${job.company}` : label;
                      }}
                    />
                    <Bar dataKey="applications" radius={[6, 6, 0, 0]}>
                      {analytics.topJobs.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-center text-gray-500">
                Applications will appear here once candidates start applying.
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white border rounded-lg p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-950">Accepted vs rejected</h2>
              <p className="text-sm text-gray-500">Decision ratio across your applicants.</p>
            </div>
            {hasStatusData ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      innerRadius={58}
                      outerRadius={102}
                      paddingAngle={3}
                      label
                    >
                      {analytics.statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} applications`, "Total"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-center text-gray-500">
                Accept or reject applications to build this ratio.
              </div>
            )}
          </div>
        </section>

        <div className="mt-10">
          <SocialFeed compact/>
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
