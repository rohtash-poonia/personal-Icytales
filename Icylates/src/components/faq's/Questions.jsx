"use client";
import { faqs } from "@/components/common/Helper";
import React from "react";
import { useState } from "react";
const Questions = () => {
  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };
  return (
    <section className="container pt-35 pb-37.5 max-lg:py-24 max-md:py-16 max-sm:py-8">
      {/* Heading */}
      <div className="text-center ">
        <h2 className="heading">
          Frequently Asked <span className="text-pink">Questions</span>
        </h2>
        <p className="text-lightbrown pt-6 text-xl leading-6.5 text-center max-md:leading-4 max-lg:text-lg max-md:text-base max-sm:text-sm max-lg:pt-5 max-md:pt-5 max-sm:pt-3">
          Some of the queries you want to know about us.
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="container pt-12.5 max-lg:pt-10 max-md:pt-6 max-sm:pt-4 grid md:grid-cols-2 gap-7.5 max-lg:gap-6 max-md:gap-4 max-sm:gap-3 items-start">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white rounded-[10px] shadow-[0_2px_73px_2px_rgba(0,0,0,0.04)] hover:shadow-md transition max-md:px-4 max-md:py-3 px-7 py-5"
          >
            {/* Question */}
            <button type="button" onClick={() => toggleFAQ(faq.id)} aria-expanded={openId === faq.id} aria-controls={`faq-answer-${faq.id}`} className="w-full text-left font-bold text-lg max-lg:font-semibold max-md:text-base leading-6 text-darkbrown">
              {faq.question}
            </button>

            {/* Answer */}
            <div
              id={`faq-answer-${faq.id}`}
              hidden={openId !== faq.id}
              className={`overflow-hidden transition-all duration-300 ${
                openId === faq.id
                  ? "h-auto mt-4 pt-4 border-t border-gray-200"
                  : "max-h-0"
              }`}
            >
              <p className="text-sm text-pink font-medium">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Questions;
