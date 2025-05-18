import CategoryIcon from "@mui/icons-material/Category";
import { Link } from "react-router-dom";

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export const TokensSkeleton = () => {
  const items = Array.from({ length: 4 });
  return (
    <ul className="grid grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2 gap-6 mb-6">
      {items.map((item, index) => {
        return (
          <li
            className={`bg-gray-200 shadow-md rounded-xl p-4 w-full max-w-sm mx-auto ${shimmer}`}
          >
            <div className="w-full h-48 object-cover rounded-lg mb-4 bg-gray-500" />
            <div className="h-[24px] w-3/4 mb-1 bg-gray-500"></div>
            <p className="w-full h-[16px] bg-gray-500 mb-1"></p>
            <p className="w-[60%] h-[16px] bg-gray-500 mb-1"></p>
            <p className="w-[30%] h-[16px] bg-gray-500 mb-1"></p>
            <p className="w-[50%] h-[16px] bg-gray-500 mb-1"></p>
            <div className="w-full mt-3 bg-gray-500 text-white h-[45px] rounded border-[1px]"></div>
          </li>
        );
      })}
    </ul>
  );
};

export const EmptyTransferList = () => {
  return (
    <div className="pt-[30px] flex justify-center">
      <div className="w-[600px] flex flex-col justify-center items-center py-10 px-5 border-[2px] border-gray-200 rounded-md text-gray-800 shadow-gray-500 shadow-lg max-sm:w-full">
        <div className="gap-1.5 flex flex-col items-center">
          <div className="-mt-1">
            <CategoryIcon className="!text-5xl text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold">No Tokens to Transfer!</h2>
        </div>
        <p className="mt-2 text-center text-lg font-medium">
          You need to mint your assets first!
        </p>
        <Link
          to={"/add"}
          className="mt-4 bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
        >
          Mint Your Assets!
        </Link>
      </div>
    </div>
  );
};

export const EmptySaleList = () => {
  return (
    <div className="pt-[30px] flex justify-center">
      <div className="w-[600px] flex flex-col justify-center items-center py-10 px-5 border-[2px] border-gray-200 rounded-md text-gray-800 shadow-gray-500 shadow-lg max-sm:w-full">
        <div className="gap-1.5 flex flex-col items-center">
          <div className="-mt-1">
            <CategoryIcon className="!text-5xl text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold">No Tokens on Sale!</h2>
        </div>
        <p className="mt-2 text-center text-lg font-medium">
          Check back soon for new tokens!
        </p>
      </div>
    </div>
  );
};

export const EmptyAssetsList = () => {
  return (
    <div className="pt-[30px] flex justify-center">
      <div className="w-[600px] flex flex-col justify-center items-center py-10 px-5 border-[2px] border-gray-200 rounded-md text-gray-800 shadow-gray-500 shadow-lg max-sm:w-full">
        <div className="gap-1.5 flex flex-col items-center">
          <div className="-mt-1">
            <CategoryIcon className="!text-5xl text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold">You do not have any tokens!</h2>
        </div>
        <p className="mt-2 text-center text-lg font-medium">
          You need to mint your assets first!
        </p>
        <Link
          to={"/add"}
          className="mt-4 bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
        >
          Mint Your Assets!
        </Link>
      </div>
    </div>
  );
};
