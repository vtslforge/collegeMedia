import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className='w-15 md:w-40 z-20 bg-amber-800 h-[95vh] border left-0 flex flex-col justify-center items-start fixed'>
            <button 
        onClick={() => navigate("/home")} 
        className="cursor-pointer"
      >
        Home
      </button>
      <button 
        onClick={() => navigate("/home/feed")} 
        className="cursor-pointer"
      >
        Feed
      </button>
    </div>
  )
}

export default Sidebar;
