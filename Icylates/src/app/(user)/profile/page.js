"use client";
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {useAuth} from '@/components/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

function ProfileForm({user,saveProfile}) {
  const [name,setName]=useState(user.name);
  const [email,setEmail]=useState(user.email);
  const [currentPassword,setCurrentPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState({error:'',success:''});
  const emailChanged=email.trim().toLowerCase()!==user.email;
  async function submit(event) {
    event.preventDefault();setBusy(true);setFeedback({error:'',success:''});
    try {
      const updated=await saveProfile({name:name.trim(),email:email.trim(),...(emailChanged ? {currentPassword} : {})});
      setName(updated.name);setEmail(updated.email);setCurrentPassword('');
      setFeedback({error:'',success:'Your profile has been updated.'});
    } catch(error) {setFeedback({error:error.message || 'Unable to update your profile.',success:''});}
    finally {setBusy(false);}
  }
  return <main className="mx-auto max-w-2xl px-5 py-16">
    <h1 className="heading text-darkbrown">My Profile</h1>
    <p className="mt-4 text-lightbrown">Manage your account details and view your orders.</p>
    <form onSubmit={submit} className="mt-8 space-y-6 rounded-3xl border border-pink/15 bg-white p-6 shadow-sm sm:p-8">
      <Input label="Name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/>
      <Input label="Email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/>
      {emailChanged && <><p className="text-sm text-lightbrown">Confirm your current password to change your email address.</p><Input label="Current password" name="currentPassword" type="password" autoComplete="current-password" required value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/></>}
      {feedback.error && <p role="alert" className="text-red-700">{feedback.error}</p>}
      {feedback.success && <p role="status" className="text-green-700">{feedback.success}</p>}
      <Button type="submit" theme="primary" loading={busy} className="px-8 py-4">Save changes</Button>
    </form>
    <nav aria-label="My account" className="mt-8 flex flex-wrap gap-6"><Link href="/orders" className="font-semibold text-pink underline">My orders</Link><Link href="/shop" className="text-pink underline">Continue shopping</Link></nav>
  </main>;
}
export default function ProfilePage() {
  const {user,loading,sessionError,saveProfile}=useAuth();
  const router=useRouter();
  useEffect(()=>{if(!loading && !user && !sessionError)router.replace('/login?returnTo=%2Fprofile');},[loading,user,sessionError,router]);
  if(loading)return <p role="status" className="py-20 text-center">Loading your profile…</p>;
  if(sessionError)return <p role="alert" className="px-5 py-20 text-center">{sessionError}</p>;
  if(!user)return <p role="status" className="py-20 text-center">Redirecting to login…</p>;
  return <ProfileForm key={user.id} user={user} saveProfile={saveProfile}/>;
}
