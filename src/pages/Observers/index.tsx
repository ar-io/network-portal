import Header from '@src/components/Header';
import Banner from './Banner';
import ObserversTable from './ObserversTable';

const Observers = () => {
  return (
    <div className="flex h-screen max-w-full flex-col gap-6 overflow-auto pb-6 pr-6 scrollbar">
      <Header />
      <Banner />
      <ObserversTable />
    </div>
  );
};

export default Observers;
