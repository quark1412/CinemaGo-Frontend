import { Spinner } from "@/components/ui/shadcn-io/spinner";

const Loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner variant="pinwheel" size={40} />
    </div>
  );
};

export default Loading;
