import { useNavigate } from "react-router-dom";

export const logoUrl =
  "https://res.cloudinary.com/dqoeyomtf/image/upload/v1779458623/logo_tctgtx.png";

const Logo = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="flex items-center text-left"
      aria-label="Go to home"
    >
      <div className="w-15 h-15 overflow-hidden">
        <img
          src={logoUrl}
          alt="PETSVETA LOGO"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h1 className="font-bold text-sky-800 text-xl">PetsVeta</h1>
        <p>Care, Connect, Cure</p>
      </div>
    </button>
  );
};

export default Logo;
