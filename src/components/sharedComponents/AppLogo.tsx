import appLogo from "../../assets/appLogo.webp";

const AppLogo = () => {
  return (
    <div className="py-6 px-8 flex justify-center sm:block select-none cursor-default">
      <img src={appLogo} className="h-8" alt="appLogo" />
    </div>
  );
};

export default AppLogo;
