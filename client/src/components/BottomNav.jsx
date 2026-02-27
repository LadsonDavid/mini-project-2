import { Link, useLocation } from 'react-router-dom';
import { 
  Dashboard as DashboardIcon, 
  MusicNote as MusicIcon, 
  SportsEsports as GamesIcon 
} from '@mui/icons-material';

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { label: 'Home', path: '/', icon: <DashboardIcon sx={{ fontSize: 24 }} /> },
    { label: 'Music', path: '/music', icon: <MusicIcon sx={{ fontSize: 24 }} /> },
    { label: 'Games', path: '/games', icon: <GamesIcon sx={{ fontSize: 24 }} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 px-4 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-primary-400'
              }`}
            >
              <div className={`p-1 mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide uppercase transition-all duration-200 ${
                isActive ? 'opacity-100 transform translate-y-0' : 'opacity-70'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full animate-fade-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
