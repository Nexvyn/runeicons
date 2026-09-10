"use client";

import Link from "next/link";

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
      "Optimized SVG, plus React and Vue components. Each one is tree-shakeable, so importing a single icon does not drag the whole set into your bundle.",
  },
  {
    id: "item-2",
    number: "02",
    question: "Can I customize the icon size and color?",
    answer:
      "Yes. Size, stroke width, and color are all controllable through props or plain CSS. Icons use currentColor by default, so they pick up whatever color their parent already has.",
  },
  {
    id: "item-3",
    number: "03",
    question: "Is Rune Icons free to use commercially?",
    answer:
      "It is licensed under Apache 2.0. Use it in personal work, client projects, or anything you sell. No attribution needed, though a star on GitHub never hurts.",
  },
  {
    id: "item-4",
    number: "04",
    question: "How do I request a new icon?",
    answer:
      "Open an issue on the GitHub repo. I go through requests most weeks and build the ones people actually vote for first.",
  },
];

export default function Faq() {
  return (
    <section className="w-full">
      <div className="relative w-full overflow-hidden px-4 py-6 sm:px-10 sm:py-8 lg:px-16 lg:py-10">
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
              <Link href="https://x.com/RuneIcon" target="_blank" rel="noopener noreferrer">
                <Button className="mt-6 w-fit">
                  Contact us <MessageCircle />
                </Button>
              </Link>
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
