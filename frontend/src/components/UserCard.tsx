import Image from "next/image";

const userCard = [
    {
        id: 1,
        name: "Học Sinh",
        count: "20.000",
        image: "/studentadmin.png",
    },
    {
        id: 2,
        name: "Giáo Viên",
        count: "1.500",
        image: "/teacheradmin.png",
    },
    {
        id: 3,
        name: "Phụ Huynh",
        count: "2.003",
        image: "/parentadmin.png",
    },
    {
        id: 4,
        name: "Nhân Viên",
        count: "1.012",
        image: "/staffadmin.png",
    },
];
const UserCard = () => {
    return (
        <div className="bg-white p-4 rounded-2xl w-full">
            <div className="flex justify-between items-center gap-4 flex-wrap">
                {userCard.map((user) => (
                    <div
                        className="odd:bg-[var(--purple-pastel)] even:bg-[var(--yellow-pastel)] rounded-2xl p-4 flex-1 min-w-[130px] hover:shadow-lg flex justify-between items-center flex-row "
                        key={user.id}
                    >
                        <div className="flex flex-col  justify-center   ">
                            <h1 className="text-sm font-medium text-gray-500 capitalize pt-1">
                                {user.name}
                            </h1>
                            <span className="text-2xl font-semibold my-2">
                                {user.count}
                            </span>
                        </div>
                        <Image
                            src={user.image}
                            alt={user.name}
                            width={80}
                            height={80}
                            className="mr-4 hidden lg:block"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserCard;
