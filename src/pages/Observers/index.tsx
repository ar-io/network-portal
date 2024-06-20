import Header from '@src/components/Header';
import Banner from './Banner';
import ObserversTable from './ObserversTable';

const Observers = () => {
  return (
    <div className="flex h-screen max-w-full flex-col gap-[24px] overflow-auto pb-[24px] pr-[24px] scrollbar">
      <Header />
      <Banner />
      <ObserversTable />
    </div>
  );
};

export default Observers;
