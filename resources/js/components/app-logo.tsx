import AppLogoIcon from './app-logo-icon';
//import AppLogo from '/storage/anaizan.png';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square  items-center justify-center rounded-md text-sidebar-primary-foreground">
                <img src={"/anaizan.png"} className=" fill-current text-white dark:text-black" />
            </div>
            {/* <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate text-blue-500 leading-tight font-semibold">
                    Gest Anaizan Master
                </span>
            </div> */}
        </>
    );
}
