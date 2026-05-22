"use client";

import { MessageCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

type FAQItem = {
  id: string;
  number: string;
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    id: "item-1",
    number: "01",
    question: "What formats are the icons available in?",
    answer:
      "All Rune Icons are available as optimized SVGs, React components, and Vue components. Each icon is tree-shakeable and can be imported individually to keep your bundle size minimal.",
  },
  {
    id: "item-2",
    number: "02",
    question: "Can I customize the icon size and color?",
    answer:
      "Absolutely! Every Rune Icon supports custom sizing, stroke width, and color via props or CSS. They inherit currentColor by default, so they naturally adapt to your design system.",
  },
  {
    id: "item-3",
    number: "03",
    question: "Is Rune Icons free to use commercially?",
    answer:
      "Yes! Rune Icons is open-source and licensed under the MIT License. You can use them in personal, commercial, and client projects without any attribution required.",
  },
  {
    id: "item-4",
    number: "04",
    question: "How do I request a new icon?",
    answer:
      "You can submit icon requests through our GitHub repository by opening an issue. Our team reviews requests weekly and we prioritize icons based on community votes and demand.",
  },
];

export default function Faq() {
  return (
    <section className="w-full py-24">
      <div className="relative w-full overflow-hidden px-4 py-8 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:gap-20">
          <div className="flex shrink-0 flex-col gap-8 lg:w-[440px]">
            <div className="flex flex-col gap-2">
              <span className="text-4xl font-medium">
                Frequently asked <br />
                <span className="text-blue-700">questions</span>
              </span>
              <p className="text-sm text-muted-foreground">
                Can’t find the answer you’re looking for? <br /> I’m here to help.
              </p>
              <Button className="mt-6 w-fit">
                Contact us <MessageCircle />
              </Button>
            </div>
          </div>

          <div className="w-full flex-1">
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-3">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="rounded-2xl border border-border bg-white px-6 last:border-b dark:bg-background"
                >
                  <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-blue-700 tabular-nums">
                        {item.number}
                      </span>
                      <span className="text-[15px] font-medium text-foreground">
                        {item.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <p className="pl-10 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
