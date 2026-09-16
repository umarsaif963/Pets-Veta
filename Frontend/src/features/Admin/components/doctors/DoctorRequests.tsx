import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Hourglass,
  Search,
  Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import DoctorFilter from "./DoctorFilter";
import { PaginationButton } from "../PaginationButton";
import DoctorRequestCard from "./DoctorRequestCard";
import {
  PendingDoctors,
  ApprovedDoctors,
  AllDoctors,
  fetchDoctorStats,
  approveDoctorRequest,
  rejectDoctorRequest,
  type DoctorStats,
  type ApiPayload
} from '../../apis/doctorquery.api';
import StatCard from "../cards/StatsCard";
import DoctorNotFound from "./DoctorNotFound";

const DoctorRequests = () => {
  const [doctorStatus, setDoctorStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [totalDoctors, setTotalDoctors] = useState<number>(0);
  const [doctorRequestProceed, setDoctorRequestProceed] = useState<boolean>(false);
  const [doctorList, setDoctorList] = useState<ApiPayload | undefined>(undefined);

  const [adminDoctorStats, setAdminDoctorStats] = useState<DoctorStats | undefined>(undefined);
  const [page, setPage] = useState<number>(1);

  const pageTitle = 'Admin Dashboard';
  const limit: number = 6;
  const totalPages = Math.ceil(totalDoctors / limit);
  const pageDescription = 'Here Admin can approve and reject the doctors based on attestation process';

  const doctorStats = async () => {
    const response = await fetchDoctorStats();
    if (response.success) {
      setAdminDoctorStats(response.data);
    }
  };

  const onApprove = async (doctorId: string): Promise<void> => {
    setDoctorRequestProceed(true);
    const response = await approveDoctorRequest(doctorId);
    if (response.success) {
      await doctorStats();
    }
    setDoctorRequestProceed(false);
  };

  const onReject = async (doctorId: string): Promise<void> => {
    setDoctorRequestProceed(true);
    const response = await rejectDoctorRequest(doctorId);
    if (response.success) {
      await doctorStats();
    }
    setDoctorRequestProceed(false);
  };


  useEffect(() => {
    let isMounted = true;

    const loadDoctorStats = async () => {
      const response = await fetchDoctorStats();
      if (isMounted && response.success) {
        setAdminDoctorStats(response.data);
      }
    };

    void loadDoctorStats();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const doctorQuery = async (status: string, currentPage: number) => {
      if (status === 'all') {
        const response = await AllDoctors(currentPage, limit);

        if (response.success) {
          setDoctorList(response.data);
          setTotalDoctors(response.data.totalCount);
        }
      } else if (status === 'pending') {
        const response = await PendingDoctors(currentPage, limit);
        if (response.success) {
          setDoctorList(response.data);
          setTotalDoctors(response.data.totalCount);
        }
      } else if (status === 'approved') {
        const response = await ApprovedDoctors(currentPage, limit);
        if (response.success) {
          setDoctorList(response.data);
          setTotalDoctors(response.data.totalCount);
        }
      }
    };
    doctorQuery(doctorStatus, page);
  }, [doctorStatus, page]);

  return (
    <main className="min-h-screen bg-[#f8fbfb] text-[#12213a]">
      <section className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-5 md:px-6 lg:px-8">
          <section className="relative overflow-hidden rounded-lg border border-[#eef2f2] bg-linear-to-r from-[#fff7f1] via-white to-[#effaf8] px-4 pb-6 pt-6 shadow-sm sm:px-6 md:px-8 md:pb-8 md:pt-9">
            <div className="relative z-10 max-w-[720px]">
              <h1 className="text-2xl font-black tracking-normal text-[#0f1b2f] sm:text-3xl md:text-4xl">
                {pageTitle}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#405169] sm:mt-4 sm:text-base sm:leading-7">
                {pageDescription}
              </p>
            </div>

            <div className="pointer-events-none absolute right-20 top-5 hidden h-44 w-72 text-[#078b91] opacity-80 xl:block">
              <ClipboardCheck className="absolute left-16 top-0 h-36 w-36 rounded-lg text-[#6bb5b0]" strokeWidth={1.8} />
              <Stethoscope className="absolute right-5 top-10 h-28 w-28 text-[#078b91]" strokeWidth={2.4} />
            </div>

            <div className="relative z-10 mt-8 grid gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.08)] sm:mt-10 md:grid-cols-2 xl:mt-14 xl:grid-cols-3">
              {/* 💡 3. Tied values directly to the live backend data properties with string parsing safety */}
              <StatCard
                title="Pending Requests"
                value={String(adminDoctorStats?.pending ?? 0)}
                tone="orange"
                icon={Hourglass}
              />
              <StatCard
                title="Approved"
                value={String(adminDoctorStats?.approved ?? 0)}
                tone="green"
                icon={CheckCircle2}
              />
              <StatCard
                title="Total Doctors"
                value={String(adminDoctorStats?.total ?? 0)}
                tone="blue"
                icon={CircleUserRound}
              />
            </div>
          </section>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#0f1b2f]">
                  Doctor List
                </h2>
                <p className="mt-1 text-sm text-[#587087]">
                  Search by name, email, phone, specialization, or doctor ID.
                </p>
              </div>

              <label className="relative block w-full lg:max-w-md">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#718198]">
                  <Search size={20} />
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search doctors..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#f8fbfb] pl-12 pr-4 font-semibold text-[#12213a] outline-none transition placeholder:text-[#8a99aa] focus:border-[#078b91] focus:bg-white focus:ring-4 focus:ring-[#078b91]/10"
                />
              </label>
            </div>
          </div>

          <DoctorFilter doctorStatus={doctorStatus} setDoctorStatus={setDoctorStatus} />

          {doctorList?.doctors && doctorList.doctors.length > 0 ? (
            doctorList.doctors.map((doctor) => (
              < DoctorRequestCard
                key={doctor.id}
                doctor={doctor}
                doctorRequestProceed={doctorRequestProceed}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))
          ) : (
            <DoctorNotFound />
          )}

          {doctorList?.doctors && doctorList.doctors.length > 0 && (
            <div className="mt-7 flex flex-col gap-4 text-sm text-[#405169] md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <PaginationButton
                  ariaLabel="Previous page"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft size={18} />
                </PaginationButton>

                <button
                  type="button"
                  className={`h-10 w-10 rounded-lg border border-slate-200 ${page === 1 ? 'bg-[#80cbc4] text-white' : 'bg-white text-[#12213a]'} font-black`}
                  onClick={() => setPage(1)}
                >
                  1
                </button>

                {totalPages >= 2 && (
                  <button
                    onClick={() => setPage(2)}
                    type="button"
                    className={`h-10 w-10 rounded-lg border border-slate-200 ${page === 2 ? 'bg-[#80cbc4] text-white' : 'bg-white text-[#12213a]'} font-black`}
                  >
                    2
                  </button>
                )}

                {page > 2 && page <= totalPages && (
                  <span title="current page" className="text-center flex justify-center items-center h-10 w-10 rounded-lg border border-slate-200 bg-[#80cbc4] text-white font-black">
                    {page}
                  </span>
                )}

                <PaginationButton
                  ariaLabel="Next page"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight size={18} />
                </PaginationButton>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default DoctorRequests;
