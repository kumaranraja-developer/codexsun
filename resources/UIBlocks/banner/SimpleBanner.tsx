import Button from "../../components/button/Button";
import { useNavigate } from "react-router-dom";

interface SimpleBannerProps {
  title: string;
  buttonLabel: string;
  imgPath: string;
  routePath?: string;
  className?: string;
  path?: string;
  buttonStyle?:string
  textStyle?:string
}

function SimpleBanner({
  title,
  buttonLabel,
  imgPath,
  routePath,
  className,
  path,
  buttonStyle,
  textStyle
}: SimpleBannerProps) {
  const navigate = useNavigate();
  const HandleRoute = () => {
    navigate(routePath ? routePath : "");
  };
  return (
    <div className={`grid grid-cols-[30%_70%] py-10 rounded-2xl shadow-lg hover:shadow-2xl shadow-black transition hover:-translate-y-2 ${className}`}>
      <img src={imgPath} alt="" className="items-center hover:animate-pulse" />
      <div className="flex flex-col justify-center items-start gap-5">
        <div className={`text-2xl md:text-4xl font-bold ${textStyle}`}>{title}</div>
        <Button
          className={`${buttonStyle}`}
          scrollToId={path}
          label={buttonLabel}
          onClick={HandleRoute}
        />
      </div>
    </div>
  );
}

export default SimpleBanner;
