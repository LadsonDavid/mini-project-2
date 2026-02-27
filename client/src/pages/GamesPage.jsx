import GamesModule from '../components/games/GamesModule';

const GamesPage = () => {
    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <span className="w-1 h-6 bg-emerald-500" />
                Wellness Games
            </h2>
            <GamesModule />
        </div>
    );
};

export default GamesPage;
