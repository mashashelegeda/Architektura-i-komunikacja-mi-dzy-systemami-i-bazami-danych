import Hero from '../components/Hero';
import SearchForm from '../components/SearchForm';

export default function Home() {
    return (
        <div>
            <Hero />
            <div className="container mx-auto px-4 py-8">
                <SearchForm />
            </div>
        </div>
    );
}