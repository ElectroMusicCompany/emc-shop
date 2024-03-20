import { Transition, Dialog } from "@headlessui/react";
import { Fragment } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { IoMdClose } from "react-icons/io";
import KenAll from "ken-all";

type AddressData = {
  zip: string;
  state: string;
  city: string;
  street: string;
  building?: string;
  phone: string;
  lastName: string;
  firstName: string;
};

export default function AddressModal({
  open,
  setOpen,
  setAddress,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  setAddress: (address: AddressData) => void;
}) {
  const {
    register,
    formState: { errors, isValid },
    setValue,
    handleSubmit,
    reset,
  } = useForm<AddressData>();

  const states = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ];

  const onSubmit: SubmitHandler<AddressData> = (data) => {
    setAddress(data);
    reset();
    setOpen(false);
  };

  const onClose = () => {
    reset();
    setOpen(false);
  };
  return (
    <Transition.Root show={open} as={Dialog} onClose={onClose}>
      <Dialog.Panel>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50">
            <div className="flex items-center justify-center min-h-screen">
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
              <div className="relative z-10 w-full h-full md:h-auto md:w-96 bg-white md:rounded-lg shadow-lg">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4"
                >
                  <IoMdClose size={24} />
                </button>
                <Dialog.Title className="text-lg font-medium text-center py-4 border-b">
                  住所の入力
                </Dialog.Title>
                <form
                  className="p-4 md:h-[75vh] overflow-scroll"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="mb-4">
                    <label htmlFor="lastName" className="block mb-1">
                      姓
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      {...register("lastName", { required: true })}
                      className="w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="firstName" className="block mb-1">
                      名
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      {...register("firstName", { required: true })}
                      className="w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <hr />
                  <div className="my-4">
                    <label htmlFor="zip" className="block mb-1">
                      郵便番号
                    </label>
                    <input
                      type="text"
                      id="zip"
                      {...register("zip", {
                        required: true,
                        pattern: /^\d{7}$/,
                      })}
                      onChange={async (e) => {
                        const zip = e.target.value;
                        if (zip.length === 7) {
                          const address = (await KenAll(zip))[0];
                          if (address) {
                            setValue("state", address[0]);
                            setValue("city", address[1]);
                            setValue("street", address[2]);
                          }
                        }
                      }}
                      className={twMerge(
                        "w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500",
                        errors.zip
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      )}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="state" className="block mb-1">
                      都道府県
                    </label>
                    <select
                      id="state"
                      {...register("state", { required: true })}
                      className={twMerge(
                        "w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500",
                        errors.state
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      )}
                    >
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="city" className="block mb-1">
                      市区町村
                    </label>
                    <input
                      type="text"
                      id="city"
                      {...register("city", { required: true })}
                      className={twMerge(
                        "w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500",
                        errors.city
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      )}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="street" className="block mb-1">
                      町名・番地
                    </label>
                    <input
                      type="text"
                      id="street"
                      {...register("street", { required: true })}
                      className={twMerge(
                        "w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500",
                        errors.street
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      )}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="building" className="block mb-1">
                      建物名（任意）
                    </label>
                    <input
                      type="text"
                      id="building"
                      {...register("building")}
                      className={twMerge(
                        "w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500",
                        errors.building
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      )}
                    />
                  </div>
                  <hr />
                  <div className="my-4">
                    <label htmlFor="phone" className="block mb-1">
                      電話番号
                    </label>
                    <input
                      type="text"
                      id="phone"
                      {...register("phone", {
                        required: true,
                        pattern: /^\d{10,11}$/,
                      })}
                      className={twMerge(
                        "w-full border rounded-md p-2 focus:ring-sky-500 focus:border-sky-500",
                        errors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      )}
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      disabled={!isValid}
                      className="bg-sky-500 text-white rounded-md px-4 py-2 duration-150 hover:bg-sky-600 disabled:bg-gray-300"
                    >
                      保存
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Transition.Child>
      </Dialog.Panel>
    </Transition.Root>
  );
}
