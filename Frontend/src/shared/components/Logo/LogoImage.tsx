import { logoUrl } from "./Logo";

interface LogoImageProps {
  alt?: string;
  className?: string;
}

const LogoImage = ({
  alt = "PetsVeta logo",
  className = "h-11 w-11 rounded-xl",
}: LogoImageProps) => (
  <img src={logoUrl} alt={alt} className={`object-cover ${className}`} />
);

export default LogoImage;