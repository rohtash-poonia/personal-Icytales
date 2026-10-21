"use client";

import { useState } from "react";
import { ContactDetails } from "../common/Helper";
import Button from "../common/Button";
import SafeImage from "../common/SafeImage";
import { RightArrow } from "../common/Icons";
import { submitContact } from "@/lib/api";

const initialForm = { firstName: "", lastName: "", email: "", phone: "", message: "" };

const GetInTouch = () => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      const result = await submitContact(form);
      setForm(initialForm);
      setStatus({ type: "success", message: result.message || "Your message has been received." });
    } catch (error) {
      setStatus({ type: "error", message: error?.message || "Your message could not be sent. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-293 flex-col items-center px-4 pb-20 pt-15 lg:pb-37.5 lg:pt-35">
      <h2 className="heading text-center max-sm:text-[45px]! max-md:text-[50px]!">Get in <span className="text-[#F83D8E]">Touch</span> With Us</h2>
      <p className="pt-4.5 text-center text-[16px] text-lightbrown sm:text-[18px] md:text-[20px]">Reach out and connect with us today for any inquiries or assistance.</p>
      <div className="flex w-full max-w-285 gap-12.5 pt-10 max-sm:flex-col md:pt-20 lg:gap-18.75">
        <div className="grid h-fit w-full max-w-75 grid-cols-1 gap-7.5 max-sm:mx-auto lg:max-w-87.5">
          {ContactDetails.map((item) => (
            <div key={item.heading} className="flex h-25 w-full items-center justify-center gap-4 rounded-[20px] border border-white shadow-[0px_2px_73px_2px_rgba(0,0,0,0.05)] sm:h-39.25 lg:gap-7.5">
              <SafeImage src={item.image} fallbackSrc="/images/placeholder.svg" alt="" width={75} height={75} className="object-contain" />
              <div>
                <h3 className="pb-2.75 text-[14px] font-bold text-[#0F0200] md:text-[18px] lg:text-[20px]">{item.heading}</h3>
                {item.subheading.map((line) => <p key={line} className="w-[191.67px] text-lightbrown max-md:text-[12px] max-lg:text-[14px]">{line}</p>)}
              </div>
            </div>
          ))}
        </div>
        <div className="w-full max-w-171.5">
          <form onSubmit={handleSubmit} className="w-full rounded-2xl bg-white">
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 lg:gap-x-6.5 lg:gap-y-5.5">
              {[
                ["firstName", "First Name", "text", true],
                ["lastName", "Last Name", "text", true],
                ["email", "Email address", "email", true],
                ["phone", "Phone", "tel", false],
              ].map(([name, label, type, required]) => (
                <label key={name} className="block text-[14px] font-medium text-lightbrown lg:text-[16px]">
                  <span className="mb-1 block lg:mb-4.5">{label}</span>
                  <input name={name} type={type} value={form[name]} onChange={update} required={required} maxLength={name === "email" ? 254 : 80} className="h-12 w-full rounded-full border border-[#E3E4E5] px-5 outline-none focus:border-purple-500" />
                </label>
              ))}
            </div>
            <label className="mt-6 block text-[14px] font-medium text-lightbrown lg:text-[16px]">
              <span className="mb-1 block lg:mb-4.5">Message</span>
              <textarea name="message" value={form.message} onChange={update} required minLength={10} maxLength={5000} rows={6} className="w-full resize-none rounded-[15px] border border-[#E3E4E5] px-5 py-3 outline-none focus:border-purple-500" />
            </label>
            {status.message && <p role={status.type === "error" ? "alert" : "status"} className={`mt-4 text-sm ${status.type === "error" ? "text-red-700" : "text-green-700"}`}>{status.message}</p>}
            <Button type="submit" loading={submitting} theme="primary" height="h-[62px]" width="w-[207.42px]" iconposition="flex gap-[21.66px]" icons={<RightArrow />} className="mt-6.25 max-md:h-[55px] max-md:w-[200px] max-md:text-[14px] md:mt-9.75">Submit Now</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GetInTouch;
