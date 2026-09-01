import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, Check, PencilLine, Plus, Send, Trash2, Users, X, XCircle } from 'lucide-react';
import { API_ROUTES, FRONTEND_ROUTES } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';

export default function ManageOpportunities() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [acceptingApplicant, setAcceptingApplicant] = useState(null);
  const [message, setMessage] = useState({ subject: '', body: '' });
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(API_ROUTES.opportunities.mine, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json()).then(setOpportunities).catch(() => setError('Unable to load your postings.'));
  }, [token]);

  const showToast = (text) => { setToast(text); window.setTimeout(() => setToast(''), 3500); };

  const viewApplicants = async (id) => {
    const response = await fetch(API_ROUTES.applications.forOpportunity(id), { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) { setError(data.detail || 'Unable to load applicants.'); return; }
    setApplicants(data); setSelectedApplicant(null);
  };

  const updateStatus = async (status) => {
    const response = await fetch(API_ROUTES.applications.status(selectedApplicant._id), { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (response.ok) {
      setApplicants((current) => current.map((item) => item._id === selectedApplicant._id ? { ...item, status } : item));
      setSelectedApplicant((current) => ({ ...current, status }));
      showToast(status === 'rejected' ? 'Application rejected successfully.' : 'Application updated successfully.');
    }
  };

  const openAcceptance = () => {
    const candidate = selectedApplicant.candidateSnapshot?.fullName || 'Candidate';
    const organization = selectedApplicant.recruiterSnapshot?.companyName || 'our organization';
    const role = selectedApplicant.opportunitySnapshot?.title || 'the role';
    const contact = selectedApplicant.recruiterSnapshot?.contactName || organization;
    setMessage({ subject: `Application update: ${role}`, body: `Dear ${candidate},\n\nThank you for your interest in ${organization} and for applying for the ${role} position. We are pleased to inform you that your application has been selected for the next stage.\n\nOur team will contact you shortly to confirm the interview date and time. Please reply with your availability and let us know if you need any accommodation.\n\nKind regards,\n${contact}\n${organization}` });
    setAcceptingApplicant(selectedApplicant); setSelectedApplicant(null);
  };

  const sendAcceptance = async (event) => {
    event.preventDefault();
    const response = await fetch(API_ROUTES.applications.message(acceptingApplicant._id), { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
    if (response.ok) {
      setApplicants((current) => current.map((item) => item._id === acceptingApplicant._id ? { ...item, status: 'accepted' } : item));
      setAcceptingApplicant(null);
      showToast('Candidate accepted and notified successfully.');
    }
    else showToast('Unable to send acceptance message.');
  };

  return <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
    {toast && <div className="fixed right-5 top-20 z-[80] flex items-center gap-2 border border-emerald-400 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-xl"><Check size={16} /> {toast}</div>}
    <div className="mx-auto max-w-5xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Management</p><h1 className="text-2xl font-black uppercase">Manage opportunities</h1></div><Link to={FRONTEND_ROUTES.postOpportunity} className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2.5 text-[11px] font-bold uppercase text-white"><Plus size={14} /> New posting</Link></div>
      {error && <p className="mb-4 border border-red-300 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      <div className="space-y-4">{opportunities.map((opp) => <div key={opp._id} className="flex flex-col gap-4 border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/70 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><BriefcaseBusiness size={18} /><div><h2 className="font-bold uppercase">{opp.title}</h2><p className="text-[10px] font-mono uppercase text-zinc-500">{opp.organization} / {opp.location}</p></div></div><div className="flex gap-2"><button type="button" onClick={() => viewApplicants(opp._id)} className="inline-flex items-center gap-2 border border-zinc-300 bg-white px-3 py-2 text-[10px] font-bold uppercase dark:border-zinc-700 dark:bg-zinc-900"><Users size={14} /> Applicants</button><button type="button" onClick={() => navigate(`${FRONTEND_ROUTES.postOpportunity}?id=${opp._id}`)} aria-label="Edit opportunity" className="border border-zinc-300 p-2 dark:border-zinc-700"><PencilLine size={14} /></button><button type="button" onClick={async () => { await fetch(API_ROUTES.opportunities.byId(opp._id), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); setOpportunities((items) => items.filter((item) => item._id !== opp._id)); }} aria-label="Delete opportunity" className="border border-red-300 p-2 text-red-600"><Trash2 size={14} /></button></div></div>)}</div>
    </div>
    {applicants.length > 0 && !selectedApplicant && <div className="fixed inset-0 z-[55] flex items-center justify-center bg-zinc-950/70 p-4"><div className="w-full max-w-2xl border border-zinc-700 bg-white p-6 dark:bg-zinc-900"><div className="mb-5 flex justify-between"><div><p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Applicants</p><h2 className="text-xl font-black uppercase">Select a candidate</h2></div><button type="button" onClick={() => setApplicants([])} aria-label="Close applicants"><X /></button></div><div className="space-y-2">{applicants.map((applicant) => <button type="button" key={applicant._id} onClick={() => setSelectedApplicant(applicant)} className="flex w-full items-center justify-between border border-zinc-200 p-4 text-left transition hover:border-zinc-500 dark:border-zinc-800"><span><strong className="block text-sm uppercase">{applicant.candidateSnapshot?.fullName || applicant.candidateSnapshot?.email}</strong><span className="text-xs text-zinc-500">{applicant.candidateSnapshot?.email} / Applied {new Date(applicant.appliedAt).toLocaleDateString()}</span></span><span className="flex items-center gap-2 text-sm font-bold uppercase">{applicant.analysis?.score ?? 'N/A'}% {applicant.status === 'accepted' ? <Check className="text-emerald-600" size={18} aria-label="Accepted" /> : applicant.status === 'rejected' ? <XCircle className="text-red-600" size={18} aria-label="Rejected" /> : <span className="text-zinc-400">Pending</span>}</span></button>)}</div></div></div>}
    {selectedApplicant && <div className="fixed inset-0 z-[55] flex items-center justify-center bg-zinc-950/70 p-4"><div className="w-full max-w-3xl border border-zinc-700 bg-white p-6 dark:bg-zinc-900"><div className="mb-5 flex justify-between"><div><p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Candidate application</p><h2 className="text-xl font-black uppercase">{selectedApplicant.candidateSnapshot?.fullName || selectedApplicant.candidateSnapshot?.email}</h2></div><button type="button" onClick={() => setSelectedApplicant(null)} aria-label="Back to applicants"><X /></button></div><div className="space-y-4 text-sm"><p>{selectedApplicant.candidateSnapshot?.email}</p><p>Education: {selectedApplicant.candidateSnapshot?.education} / {selectedApplicant.candidateSnapshot?.degreeField}</p><p>Skills: {(selectedApplicant.candidateSnapshot?.skills || []).join(', ') || 'None listed'}</p><p>Experience: {selectedApplicant.candidateSnapshot?.experience || 'Not provided'}</p><p>Applied: {new Date(selectedApplicant.appliedAt).toLocaleString()}</p><p>Fit score: {selectedApplicant.analysis?.score}%</p><p className="text-emerald-600">Matched: {(selectedApplicant.analysis?.matchedSkills || []).join(', ') || 'None'}</p><p className="text-amber-600">Gaps: {(selectedApplicant.analysis?.skillGaps || []).join(', ') || 'None'}</p><p className="border-t border-zinc-200 pt-3 text-zinc-500">{selectedApplicant.analysis?.summary}</p>{selectedApplicant.candidateSnapshot?.cv?.data_base64 && <a className="inline-block font-bold text-blue-600 underline" download={selectedApplicant.candidateSnapshot.cv.filename} href={`data:${selectedApplicant.candidateSnapshot.cv.content_type || 'application/octet-stream'};base64,${selectedApplicant.candidateSnapshot.cv.data_base64}`}>Download CV</a>}</div><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={openAcceptance} className="inline-flex items-center justify-center gap-2 bg-emerald-600 px-4 py-3 text-xs font-bold uppercase text-white"><Send size={14} /> Accept</button><button type="button" onClick={() => updateStatus('rejected')} className="inline-flex items-center justify-center gap-2 border border-red-300 px-4 py-3 text-xs font-bold uppercase text-red-700"><XCircle size={14} /> Reject</button></div></div></div>}
    {acceptingApplicant && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/70 p-4"><form onSubmit={sendAcceptance} className="w-full max-w-2xl border border-zinc-700 bg-white p-6 shadow-2xl dark:bg-zinc-900"><div className="mb-5 flex justify-between"><div><p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Acceptance message</p><h2 className="text-xl font-black uppercase">Review and send</h2></div><button type="button" onClick={() => setAcceptingApplicant(null)} aria-label="Close message"><X /></button></div><p className="mb-3 text-xs text-zinc-500">Only sending this message accepts the candidate and creates their notification.</p><input required value={message.subject} onChange={(event) => setMessage({ ...message, subject: event.target.value })} className="mb-3 w-full border border-zinc-300 bg-transparent p-3 text-xs dark:border-zinc-700" /><textarea required value={message.body} onChange={(event) => setMessage({ ...message, body: event.target.value })} className="mb-4 h-56 w-full border border-zinc-300 bg-transparent p-3 text-sm leading-6 dark:border-zinc-700" /><div className="flex justify-end gap-3"><button type="button" onClick={() => setAcceptingApplicant(null)} className="border border-zinc-300 px-4 py-2 text-xs font-bold uppercase">Cancel</button><button type="submit" className="inline-flex items-center gap-2 bg-zinc-900 px-5 py-2 text-xs font-bold uppercase text-white"><Send size={14} /> Send acceptance</button></div></form></div>}
  </div>;
}
