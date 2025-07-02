import PortfolioCard from "./PortfolioCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const NewPortfolioModal = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-cyan-400">
          New Portfolio
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-indigo-200 m-3">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Portfolio</h4>
            <p className="text-muted-foreground text-sm">
              Set initial information
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="Name">Name</Label>
              <Input
                id="Name"
                placeholder="Portfolio Name"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description"
                className="col-span-2 h-8"
              />
            </div>
            <Button variant="outline" className="bg-indigo-400">
              {" "}
              Create Portfolio
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const PortfolioList = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <PortfolioCard />
      <PortfolioCard />
      <PortfolioCard />
      <NewPortfolioModal />
    </div>
  );
};

export default PortfolioList;
