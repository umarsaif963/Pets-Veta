import { Bot, PawPrint, ShoppingCart, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import catAndDog from "@/assets/shared/images/catanddog.png";
import LogoImage from "@/shared/components/Logo/LogoImage";
import FeatureItem from "./FeatureItem";

const HANDWRITTEN_FONT = {
  fontFamily: "'Segoe Script','Bradley Hand','Comic Sans MS',cursive",
} as const;

const features = [
  {
    icon: <PawPrint className="h-5 w-5" />,
    title: "Buy & Sell Pets",
  },
  {
    icon: <Stethoscope className="h-5 w-5" />,
    title: "Book Vet Appointments",
  },
  {
    icon: <ShoppingCart className="h-5 w-5" />,
    title: "Pet Products & Accessories",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: "AI Pet Assistant",
  },
];

const BrandPanel = () => {
  return (
    <div className="relative h-full w-full">
      {/* Desktop: full-page brand background */}
      <div className="relative hidden h-full w-full overflow-hidden lg:flex lg:flex-col">
        {/* Cat & dog image anchored bottom-left */}
        <img
          src={catAndDog}
          alt="A cat and dog relaxing together"
          className="absolute bottom-0 left-0 h-[120%] w-full object-cover object-bottom-left"
          loading="lazy"
        />

        {/* Soft overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f4fbff]/90 via-[#f4fbff]/60 to-transparent" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 py-8 xl:px-16">
          {/* Logo */}
          <div>
            <Link
              to="/"
              aria-label="PetsVeta home"
              className="inline-flex w-fit items-center gap-3 transition hover:opacity-85"
            >
              <span className="block overflow-hidden rounded-2xl bg-white shadow-[0_10px_22px_rgba(0,159,157,0.32)]">
                <LogoImage className="h-11 w-11" />
              </span>

              <span className="text-left">
                <span className="block text-[22px] font-extrabold leading-none tracking-tight text-[#07182c]">
                  PetsVeta
                </span>

                <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.28em] text-[#009f9d]">
                  Health • Care • Community
                </span>
              </span>
            </Link>
          </div>

          {/* Heading + features */}
          <div className="max-w-[620px]">
            <h1 className="text-[46px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#07182c] xl:text-[54px]">
              Happy Pets,
              <br />
              <span className="text-[#00a7a5]">Healthier Lives</span>
            </h1>

            <p className="mt-4 text-[15px] font-medium leading-[1.7] text-slate-600">
              From expert veterinary care to the best pet products,
              <br />
              we're here for every step of your pet's journey.
            </p>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-5">
              {features.map((feature) => (
                <FeatureItem key={feature.title} {...feature} />
              ))}
            </div>
          </div>

          {/* Handwritten phrase */}
          <p
            className="pb-2 text-center text-[18px] leading-snug text-[#009f9d]"
            style={HANDWRITTEN_FONT}
          >
            Better Care Together
          </p>
        </div>
      </div>

      {/* Mobile: cat & dog image as background */}
      <div className="relative h-full w-full overflow-hidden lg:hidden">
        <img
          src={catAndDog}
          alt="A cat and dog relaxing together"
          className="absolute bottom-0 left-0 h-[120%] w-full object-cover object-bottom-left"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#f4fbff]/95 via-[#f4fbff]/70 to-transparent" />

        <p
          className="absolute inset-x-0 bottom-0 pb-8 text-center text-[20px] text-[#009f9d]"
          style={HANDWRITTEN_FONT}
        >
          Better Care Together
        </p>
      </div>
    </div>
  );
};

export default BrandPanel;