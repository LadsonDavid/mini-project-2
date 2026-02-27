import MusicPlayer from '../components/MusicPlayer';

const MusicPage = () => {
    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <span className="w-1 h-6 bg-indigo-500" />
                Music Therapy
            </h2>
            <div className="max-w-2xl mx-auto">
                <MusicPlayer />
            </div>
        </div>
    );
};

export default MusicPage;
